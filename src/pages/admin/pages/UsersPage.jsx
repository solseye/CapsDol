import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers } from "../../../api/adminApi";
import "./UsersPage.css";

const ITEMS_PER_PAGE = 20;

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminUsers({
        limit: 100,
        offset: 0,
      });

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const values = [
        user.uid,
        user.username,
        user.email,
        user.provider,
        user.uuid,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      );
    });
  }, [users, searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleOpenUser = (user) => {
    if (!user.uuid) {
      setError("사용자 UUID가 없어 상세 페이지를 열 수 없습니다.");
      return;
    }

    navigate(`/admin/users/${encodeURIComponent(user.uuid)}`, {
      state: {
        user,
      },
    });
  };

  return (
    <div className="usr-page-container">
      {error && (
        <div
          className="usr-empty-row"
          style={{
            color: "red",
            padding: "12px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {error}
        </div>
      )}

      <div className="usr-card">
        {/* 1. 상단 헤더 영역 */}
        <div className="usr-card-header">
          <div className="usr-header-title-group">
            <h2 className="usr-title">사용자 목록</h2>
            <p className="usr-subtitle">현재 등록된 사용자 목록</p>
          </div>

          <div className="usr-header-controls">
            {/* 검색창 */}
            <div className="usr-search-wrapper">
              <svg
                className="usr-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="usr-search-input"
                placeholder="이름,이메일,아이디 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* 새로고침 버튼 */}
            <button
              type="button"
              className="usr-refresh-btn"
              onClick={fetchUsers}
              disabled={isLoading}
              title="목록 새로고침"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>{isLoading ? "조회 중..." : "새로고침"}</span>
            </button>
          </div>
        </div>

        {/* 2. 테이블 영역 (사용자명, 이메일만 표시) */}
        <div className="usr-table-container">
          <table className="usr-table">
            <thead>
              <tr>
                <th>사용자명</th>
                <th>이메일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="2" className="usr-empty-row">
                    사용자 목록을 불러오는 중입니다...
                  </td>
                </tr>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user.uuid || user.id}
                    className="usr-clickable-row"
                    onClick={() => handleOpenUser(user)}
                    tabIndex={0}
                    role="link"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenUser(user);
                      }
                    }}
                  >
                    <td className="col-bold">{user.username || "-"}</td>
                    <td>{user.email || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="usr-empty-row">
                    {searchKeyword.trim()
                      ? "검색 결과가 존재하지 않습니다."
                      : "가입된 사용자가 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. 하단 푸터 영역 */}
        <div className="usr-card-footer">
          <div className="usr-footer-info">
            총 <strong>{totalItems}</strong>명 중{" "}
            <strong>
              {startItem} - {endItem}
            </strong>
            번째 표시 중
          </div>

          <div className="usr-pagination">
            <button
              className="usr-page-btn nav-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  className={`usr-page-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              className="usr-page-btn nav-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
