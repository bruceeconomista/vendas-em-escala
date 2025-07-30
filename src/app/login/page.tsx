import LoginForm from '@/components/LoginForm'; // ajuste o caminho se estiver diferente

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 px-4">
      <LoginForm />
    </main>
  );
}