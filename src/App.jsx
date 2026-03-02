import { useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import TodoList from './components/TodoList'
import { Toaster } from 'react-hot-toast'

function App() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8 flex flex-col items-center">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px'
        }
      }} />
      <header className="w-full max-w-3xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Tasks<span className="text-blue-500">.</span>
        </h1>
        {user ? (
          <button
            onClick={signOut}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        ) : (
          <div className="text-sm text-neutral-400">Not logged in</div>
        )}
      </header>

      <main className="w-full max-w-3xl bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-xl p-6 shadow-xl min-h-[50vh]">
        {user ? (
          <TodoList />
        ) : (
          <Auth />
        )}
      </main>
    </div>
  )
}

export default App
