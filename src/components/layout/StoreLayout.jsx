import { Outlet } from "react-router"
import Header from "./Header"
import Footer from "./Footer"
import BottomNav from "./BottomNav"

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />
      {/* En móvil deja aire bajo el contenido para el BottomNav fijo (+ safe area) */}
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
