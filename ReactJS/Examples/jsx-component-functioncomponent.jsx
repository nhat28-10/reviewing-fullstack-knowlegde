/*
  JSX, Component và Function Component trong React

  File này minh họa:
  - JSX là cú pháp mô tả UI trong JavaScript.
  - Component là một phần UI có thể tái sử dụng.
  - Function component là function return về JSX.
  - Component nên được dùng bằng cú pháp <Component />.

  Có thể copy component App vào một project React/Vite để chạy thử.
*/

const users = [
  {
    id: 1,
    name: "Nhat",
    role: "Frontend Developer",
    isOnline: true,
  },
  {
    id: 2,
    name: "Minh",
    role: "Backend Developer",
    isOnline: false,
  },
  {
    id: 3,
    name: "Linh",
    role: "Fullstack Developer",
    isOnline: true,
  },
];

function Header() {
  const title = "User List";

  return (
    <header className="header">
      <h1>{title}</h1>
      <p>Example về JSX, component và function component</p>
    </header>
  );
}

function UserStatus({ isOnline }) {
  return (
    <span className={isOnline ? "status status-online" : "status status-offline"}>
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

function UserCard({ user }) {
  function handleViewProfile() {
    console.log(`View profile: ${user.name}`);
  }

  return (
    <article className="user-card">
      <div>
        <h2>{user.name}</h2>
        <p>{user.role}</p>
      </div>

      <UserStatus isOnline={user.isOnline} />

      <button type="button" onClick={handleViewProfile}>
        View profile
      </button>
    </article>
  );
}

function EmptyState({ total }) {
  if (total > 0) {
    return null;
  }

  return <p>Chưa có user nào.</p>;
}

function UserList() {
  return (
    <section>
      <h2>Team members</h2>

      <EmptyState total={users.length} />

      <div className="user-list">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <UserList />
      </main>
    </>
  );
}
