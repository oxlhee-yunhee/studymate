import { useState, useRef, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as studyApi from '../api/studyApi';
import { auth } from '../firebase';

// 배포 시 .env의 REACT_APP_WS_URL 로 지정한다.
// 예) REACT_APP_WS_URL=https://studymate-api-xxxx.a.run.app/ws-chat
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws-chat';

/**
 * 채팅 도메인 훅
 * - STOMP over SockJS 연결을 앱 수명 동안 1개만 유지
 * - 채팅방 입장 시 해당 방(/topic/chat/{studyId}) 구독, 퇴장 시 해제
 * - 하단 네비게이션 배지용 전체 안읽음 수 관리
 *
 * @param {string} currentUserId - 로그인한 사용자 ID (없으면 연결하지 않음)
 */
export default function useChat(currentUserId) {
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); // { studyId, studyTitle, memberCount }
  const [messages, setMessages] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const activeRoomIdRef = useRef(null); // 콜백에서 최신 방 ID 참조용

  /** 현재 활성 방을 구독 (연결/재연결 시, 방 입장 시 공용) */
  const subscribeActiveRoom = useCallback(() => {
    const client = clientRef.current;
    const roomId = activeRoomIdRef.current;
    if (!client || !client.connected || roomId == null) return;

    if (subscriptionRef.current) {
      try { subscriptionRef.current.unsubscribe(); } catch (e) { /* 이미 끊긴 경우 무시 */ }
      subscriptionRef.current = null;
    }
    subscriptionRef.current = client.subscribe(`/topic/chat/${roomId}`, (frame) => {
      const msg = JSON.parse(frame.body);
      setMessages((prev) => [...prev, msg]);
      // 방을 보고 있으므로 즉시 읽음 처리
      if (activeRoomIdRef.current === roomId) {
        studyApi.markChatRead(roomId, currentUserId).catch(() => {});
      }
    });
  }, [currentUserId]);

  // ── 연결 관리 ──────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 4000,
      // 연결/재연결 직전에 최신 ID 토큰을 CONNECT 헤더에 실어 보낸다.
      beforeConnect: async () => {
        const user = auth.currentUser;
        if (!user) {
          client.connectHeaders = {};
          return;
        }
        try {
          const token = await user.getIdToken();
          client.connectHeaders = { Authorization: `Bearer ${token}` };
        } catch (e) {
          console.error('채팅 인증 토큰 발급 실패', e);
          client.connectHeaders = {};
        }
      },
      onConnect: () => {
        setIsConnected(true);
        subscribeActiveRoom(); // 재연결 시 보고 있던 방 재구독
      },
      onDisconnect: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
    });
    client.activate();
    clientRef.current = client;

    return () => {
      subscriptionRef.current = null;
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [currentUserId, subscribeActiveRoom]);

  // ── 데이터 로드 ────────────────────────────────────
  const loadChatRooms = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await studyApi.fetchChatRooms(currentUserId);
      setChatRooms(res.data);
      setTotalUnread(res.data.reduce((sum, r) => sum + (r.unreadCount || 0), 0));
    } catch (err) {
      console.error('채팅방 목록 로드 오류', err);
    }
  }, [currentUserId]);

  const refreshUnreadCount = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await studyApi.fetchTotalUnreadCount(currentUserId);
      setTotalUnread(res.data.totalUnread || 0);
    } catch (err) {
      console.error('안읽음 수 조회 오류', err);
    }
  }, [currentUserId]);

  // ── 방 입장 / 퇴장 ─────────────────────────────────
  const enterRoom = useCallback(async (room) => {
    if (!currentUserId) return;
    try {
      const res = await studyApi.fetchChatMessages(room.studyId, currentUserId);
      setMessages(res.data);
      setActiveRoom(room);
      activeRoomIdRef.current = room.studyId;
      subscribeActiveRoom(); // 미연결 상태였다면 onConnect에서 자동 구독됨
      refreshUnreadCount();
    } catch (err) {
      console.error('채팅방 입장 오류', err);
      const message = err.response?.data;
      alert(typeof message === 'string' ? message : '채팅방에 입장할 수 없습니다.');
      throw err;
    }
  }, [currentUserId, refreshUnreadCount, subscribeActiveRoom]);

  const leaveRoom = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    activeRoomIdRef.current = null;
    setActiveRoom(null);
    setMessages([]);
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // ── 메시지 전송 ────────────────────────────────────
  const sendMessage = useCallback((content) => {
    const client = clientRef.current;
    const trimmed = content.trim();
    if (!client || !client.connected || !activeRoomIdRef.current || !trimmed) return false;
    client.publish({
      destination: `/app/chat/${activeRoomIdRef.current}`,
      body: JSON.stringify({ senderId: currentUserId, content: trimmed }),
    });
    return true;
  }, [currentUserId]);

  // ── 배지 폴링 (채팅방 밖에서도 갱신) ────────────────
  useEffect(() => {
    if (!currentUserId) return;
    refreshUnreadCount();
    const timer = setInterval(refreshUnreadCount, 15000);
    return () => clearInterval(timer);
  }, [currentUserId, refreshUnreadCount]);

  return {
    chatRooms,
    activeRoom,
    messages,
    totalUnread,
    isConnected,
    loadChatRooms,
    enterRoom,
    leaveRoom,
    sendMessage,
    refreshUnreadCount,
  };
}
