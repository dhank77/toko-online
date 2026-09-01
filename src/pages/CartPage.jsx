import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { formatRupiah } from '../lib/utils'

export default function CartPage() {
  const {
    items,
    loading,
    increment,
    decrement,
    removeItem,
    removeSelected,
    toggleSelect,
    toggleSelectAll,
    selectedCount,
    selectedSubtotal,
    tax,
    total,
  } = useCart()
  const { user } = useAuth()

  const allSelected = items.length > 0 && items.every((item) => item.selected)

  if (!user) {
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Please login to view your shopping cart.</p>
          <Link to="/login" className="text-primary font-medium hover:underline">
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  if (loading && items.length === 0) {
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background p-6 rounded-xl border border-border animate-pulse flex gap-4 items-center">
              <div className="w-24 h-24 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/" className="text-primary font-medium hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid checkout-grid gap-8 items-start">
          {/* Left: Cart Items */}
          <div className="space-y-6">
            {/* Select All Header */}
            <div className="bg-background p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Select All ({items.length} items)
                </span>
              </label>
              <Button
                variant="ghost"
                className="text-destructive font-medium"
                onClick={removeSelected}
                disabled={selectedCount === 0}
              >
                Delete Selected
              </Button>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="item-row bg-background p-6 rounded-xl border border-transparent hover:border-border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                    <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          className="w-full h-full object-cover"
                          data-alt={item.name}
                          src={item.image}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="delete-btn opacity-0 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <span className="material-symbols-outlined" data-icon="delete">
                          delete
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-primary font-semibold text-xl">{formatRupiah(item.price)}</div>
                      <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-background rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg" data-icon="remove">
                            remove
                          </span>
                        </button>
                        <span className="w-10 text-center font-medium quantity">{item.quantity}</span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-background rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg" data-icon="add">
                            add
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <aside className="space-y-6 sticky top-24">
            <div className="bg-background p-8 rounded-xl border border-border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Ringkasan Pesanan</h2>
              <div className="space-y-4 pb-6 border-b border-border">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({selectedCount} items)</span>
                  <span className="text-foreground font-semibold">
                    {formatRupiah(selectedSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Pengiriman</span>
                  <span className="text-secondary font-semibold">GRATIS</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Estimasi pajak</span>
                  <span className="text-foreground font-semibold">{formatRupiah(tax)}</span>
                </div>
              </div>
              <div className="py-6 space-y-4">
                <label className="text-sm font-medium text-muted-foreground block">Kode Promo</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode"
                    type="text"
                    className="flex-grow"
                  />
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Terapkan
                  </Button>
                </div>
              </div>
              <div className="flex justify-between py-6">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
              </div>
              <Button className="w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                <span>Lanjut ke Pembayaran</span>
                <span className="material-symbols-outlined" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </Button>
              {/* Payment Methods */}
              <div className="mt-8">
                <p className="text-xs text-muted-foreground text-center uppercase tracking-wider mb-4">
                  Metode Pembayaran Aman
                </p>
                <div className="flex justify-center items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-300">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-secondary" data-icon="account_balance_wallet">
                        account_balance_wallet
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">GOPAY</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary" data-icon="payments">
                        payments
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">OVO</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-foreground" data-icon="qr_code_2">
                        qr_code_2
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">QRIS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary" data-icon="verified_user">
                verified_user
              </span>
              <p className="text-sm text-muted-foreground">
                Belanja dengan percaya diri dengan{' '}
                <span className="text-primary font-semibold">Jaminan Pembelian Aman</span>. Pengembalian
                mudah dalam 30 hari.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
