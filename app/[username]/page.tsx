export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <p className="text-white/60 mb-4">@{params.username}</p>
      <p className="text-white/60">Profile information for @{params.username}</p>
    </div>
  )
}
