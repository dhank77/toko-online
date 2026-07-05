import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import TopNavBar from './TopNavBar'

export default function NavWithCart() {
  const { count } = useCart()

  return (
    <TopNavBar cartCount={count} />
  )
}
