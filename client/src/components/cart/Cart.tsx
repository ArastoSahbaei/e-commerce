import './Cart.css'
import { useHistory } from 'react-router-dom'
import RoutingPath from '../../routes/RoutingPath'
import { useContext } from 'react'
import { UserContext } from '../../shared/provider/UserProvider'
import APIService from '../../shared/api/service/APIService'
import emptyCart from '../../shared/images/empty_cart.png'

export const Cart = (props: { isShoppingBagOpen: boolean, setIsShoppingBagOpen: (handler: boolean) => void }) => {
	const history = useHistory()
	const { isShoppingBagOpen, setIsShoppingBagOpen } = props
	const [authenticatedUser, setAuthenticatedUser] = useContext(UserContext)

	const navigateToCheckout = () => {
		history.push(RoutingPath.checkoutView)
		setIsShoppingBagOpen(false)
	}

	const navigateToShop = () => {
		history.push(RoutingPath.productsView)
		props.setIsShoppingBagOpen(false)
	}

	const displayEmptyCart = () => {
		return <div>
			<img src={emptyCart} alt='' className='emptyCartImg' />
			<p>Your cart is empty.. <br /> Why not fill it with new designs?</p>
			<button onClick={() => navigateToShop()}>Butik</button> <br />
		</div>
	}

	const displayCartWithItems = () => {
		return <div>
			{authenticatedUser?.shoppingCart?.products?.map(
				(product: any, index: number) =>
					<ul key={index} onClick={() => removeProductFromCart(authenticatedUser?.shoppingCart?.products, index)}>
						<li>{product.title}</li>
						<li>{product.price} :-</li>
						<hr />
					</ul>
			)}
			<div className='cartDiv'>
				<p>100 dagars ångerrätt med gratis retur</p>
				<p>frakt: 0kr</p>
				<p>Total summa: {Math.random()}</p>
				<button onClick={() => setIsShoppingBagOpen(false)}>fortsätt handla</button>
				<button onClick={() => navigateToCheckout()}>Gå vidare till kassan</button>
			</div>
		</div>
	}

	const displayCart = () => {
		return authenticatedUser?.shoppingCart?.products?.length === 0
			? displayEmptyCart()
			: displayCartWithItems()
	}

	const removeProductFromCart = async (array: [], index: number) => {
		const newArray = [...array.slice(0, index), ...array.slice(index + 1)]

		await APIService.updateCart({
			cartId: authenticatedUser?.shoppingCart?._id,
			products: newArray
		})
		setAuthenticatedUser({ ...authenticatedUser, shoppingCart: { ...authenticatedUser.shoppingCart, products: newArray } })
	}

	return (
		<div className={isShoppingBagOpen ? 'cart-drawer open' : 'cart-drawer'}>
			<span>5 föremål i varukorgen</span>
			<span onClick={() => setIsShoppingBagOpen(false)}>X</span>
			{displayCart()}

		</div>
	)
}

