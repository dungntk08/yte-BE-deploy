import { Header } from './components/Header';
import { StudentTable } from './components/StudentTable';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6">
        <StudentTable />
      </main>
    </div>
  );
}
