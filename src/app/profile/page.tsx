import { CgProfile } from "react-icons/cg";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-lg px-4">

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center border-b border-slate-200 px-6 py-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50 p-1 ring-1 ring-slate-200 shadow">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <CgProfile className="h-12 w-12 text-slate-500" aria-hidden="true" />
                </div>
              </div>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">Admin User</h2>
            <p className="text-slate-600">admin@example.com</p>
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            <h3 className="mb-4 text-lg font-semibold text-blue-700">Change Password</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
                  Current Password
                </label>
                <input
                  type="password" id="currentPassword"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password" id="newPassword"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password" id="confirmPassword"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
