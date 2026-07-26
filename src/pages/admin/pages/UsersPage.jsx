import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers } from "../../../api/adminApi";
import "../admin.css";

function getProviderLabel(provider) {
  switch (provider) {
    case "local":
      return "일반 가입";
    case "google":
      return "Google";
    case "kakao":
      return "Kakao";
    case "naver":
      return "Naver";
    default:
      return provider || "-";
  }
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminUsers({
        limit: 100,
        offset: 0,
      });

      setUsers(
        Array.isArray(data.users) ? data.users : []
      );

      setTotal(Number(data.total || 0));
    } catch (err) {
      setError(
        err.message || "사용자 목록을 불러오지 못했습니다."
      );
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
          .includes(keyword)
      );
    });
  }, [users, searchKeyword]);

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
    <main className="adm-main users-page">
      <section className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Users</p>
          <h1>사용자 목록</h1>
          <p>
            가입된 사용자 정보를 확인하고 관리합니다.
          </p>
        </div>

        <button
          type="button"
          className="adm-btn ghost"
          onClick={fetchUsers}
          disabled={isLoading}
        >
          {isLoading ? "조회 중..." : "새로고침"}
        </button>
      </section>

      <section className="adm-card users-summary-card">
        <div className="users-summary-item">
          <span>전체 사용자</span>
          <strong>{total}</strong>
        </div>

        <div className="users-summary-item">
          <span>현재 표시</span>
          <strong>{filteredUsers.length}</strong>
        </div>
      </section>

      <section className="adm-card users-list-card">
        <div className="adm-card-head">
          <div>
            <p className="adm-eyebrow">
              User Accounts
            </p>
            <h2>가입 사용자</h2>
          </div>

          <div className="users-search-box">
            <input
              type="search"
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(event.target.value)
              }
              placeholder="이름, 아이디, 이메일 검색"
              aria-label="사용자 검색"
            />
          </div>
        </div>

        {error && (
          <p className="login-error">{error}</p>
        )}

        {isLoading ? (
          <div className="reserve-empty-box">
            사용자 목록을 불러오는 중입니다.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="reserve-empty-box">
            {searchKeyword.trim()
              ? "검색 조건에 맞는 사용자가 없습니다."
              : "가입된 사용자가 없습니다."}
          </div>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>사용자명</th>
                  <th>아이디</th>
                  <th>이메일</th>
                  <th>가입 방식</th>
                  <th>UUID</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                    <tr
                    key={user.uuid || user.id}
                    className="users-clickable-row"
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
                    <td>{user.id ?? "-"}</td>

                    <td>
                      <strong>
                        {user.username || "-"}
                      </strong>
                    </td>

                    <td>{user.uid || "-"}</td>

                    <td>{user.email || "-"}</td>

                    <td>
                      <span className="users-provider-badge">
                        {getProviderLabel(
                          user.provider
                        )}
                      </span>
                    </td>

                    <td>
                      <code className="users-uuid">
                        {user.uuid || "-"}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}