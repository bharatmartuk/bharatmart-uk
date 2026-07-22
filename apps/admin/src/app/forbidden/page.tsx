export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">403 - Forbidden</h1>
      <p className="text-muted-foreground">
        You are signed in, but this account does not have admin access.
      </p>
      <a href="/login" className="text-primary underline-offset-4 hover:underline">
        Use a different account
      </a>
    </main>
  )
}
