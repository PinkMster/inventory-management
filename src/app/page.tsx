import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">재고 관리 시스템</h1>
          <p className="text-gray-600">현대적인 창고 및 재고 관리 솔루션</p>
        </div>
        
        <LoginForm />
      </div>
    </main>
  );
}