import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const {
    items,
    increment,
    decrement,
    removeItem,
    toggleSelect,
    toggleSelectAll,
    selectedCount,
    selectedSubtotal,
    tax,
    total,
  } = useCart()

  const allSelected = items.length > 0 && items.every((item) => item.selected)

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl">
      <h1 className="font-headline-lg text-headline-lg mb-lg">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-xl">
          <p className="text-on-surface-variant font-body-md mb-4">Your cart is empty.</p>
          <Link to="/" className="text-primary font-label-md hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid checkout-grid gap-lg items-start">
          {/* Left: Cart Items */}
          <div className="space-y-md">
            {/* Select All Header */}
            <div className="bg-surface p-sm rounded-xl shadow-ambient flex items-center justify-between border border-outline-variant">
              <label className="flex items-center gap-sm cursor-pointer group">
                <input
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                  type="checkbox"
                />
                <span className="font-label-md text-on-surface group-hover:text-primary transition-colors">
                  Select All ({items.length} items)
                </span>
              </label>
              <button className="text-error font-label-md hover:underline">
                Delete Selected
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-base">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="item-row bg-surface p-md rounded-xl shadow-ambient border border-transparent hover:border-outline-variant transition-all flex flex-col sm:flex-row gap-md items-start sm:items-center"
                >
                  <div className="flex items-center gap-md w-full sm:w-auto">
                    <input
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 rounded border-outline text-primary focus:ring-primary shrink-0"
                      type="checkbox"
                    />
                    <div className="w-24 h-24 rounded-lg bg-surface-container overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        data-alt={item.name}
                        src={item.image}
                      />
                    </div>
                  </div>
                  <div className="flex-grow space-y-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline-md text-[18px] text-on-surface">{item.name}</h3>
                        {item.variant && (
                          <p className="text-body-sm text-on-surface-variant">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="delete-btn opacity-0 text-outline hover:text-error transition-all"
                      >
                        <span className="material-symbols-outlined" data-icon="delete">
                          delete
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-sm">
                      <div className="text-primary font-headline-md text-[20px]">{item.price}</div>
                      <div className="flex items-center bg-surface-container rounded-lg p-1 border border-outline-variant">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]" data-icon="remove">
                            remove
                          </span>
                        </button>
                        <span className="w-10 text-center font-label-md quantity">{item.quantity}</span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]" data-icon="add">
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
          <aside className="space-y-md sticky top-24">
            <div className="bg-surface p-xl rounded-xl shadow-elevated border border-outline-variant">
              <h2 className="font-headline-md text-headline-md mb-md">Order Summary</h2>
              <div className="space-y-sm pb-md border-b border-outline-variant">
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Subtotal ({selectedCount} items)</span>
                  <span className="text-on-surface font-semibold">
                    ${selectedSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-secondary font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Tax estimate</span>
                  <span className="text-on-surface font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="py-md space-y-sm">
                <label className="font-label-md text-on-surface-variant block">Promo Code</label>
                <div className="flex gap-xs">
                  <input
                    className="flex-grow px-4 py-2 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-sm"
                    placeholder="Enter code"
                    type="text"
                  />
                  <button className="px-6 py-2 border-2 border-primary text-primary font-label-md rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                    Apply
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-md">
                <span className="font-headline-md text-[20px]">Total</span>
                <span className="font-headline-md text-[24px] text-primary">${total.toFixed(2)}</span>
              </div>
              <button className="w-full py-4 bg-primary text-on-primary font-headline-md rounded-xl hover:bg-on-primary-fixed-variant shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-sm mt-md">
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </button>
              {/* Payment Methods */}
              <div className="mt-xl">
                <p className="font-label-sm text-outline text-center uppercase tracking-wider mb-sm">
                  Secure Payment Methods
                </p>
                <div className="flex justify-center items-center gap-md grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <div className="flex flex-col items-center gap-xs">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] text-secondary" data-icon="account_balance_wallet">
                        account_balance_wallet
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-outline">GOPAY</span>
                  </div>
                  <div className="flex flex-col items-center gap-xs">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] text-primary" data-icon="payments">
                        payments
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-outline">OVO</span>
                  </div>
                  <div className="flex flex-col items-center gap-xs">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] text-on-surface" data-icon="qr_code_2">
                        qr_code_2
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-outline">QRIS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-md rounded-xl flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary" data-icon="verified_user">
                verified_user
              </span>
              <p className="text-body-sm text-on-surface-variant">
                Shop confidently with our{' '}
                <span className="text-primary font-semibold">Secure Purchase Guarantee</span>. 30-day easy
                returns.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
