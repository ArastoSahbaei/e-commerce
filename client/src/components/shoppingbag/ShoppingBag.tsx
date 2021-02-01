import shoppingbag from '../../shared/images/shoppingbag.svg'
import { useContext } from 'react'
import './ShoppingBag.css'
import { UserContext } from '../../shared/provider/UserProvider'


export const ShoppingBag = (props: { setIsShoppingBagOpen: (handler: boolean) => void }) => {
	const { setIsShoppingBagOpen } = props
	const [authenticatedUser,] = useContext(UserContext)

	const displayAmountOfItemsInCart = () => {
		if (authenticatedUser?.shoppingCart[0]?.products?.length != 0) {
			return <span>{authenticatedUser?.shoppingCart[0]?.products?.length}</span>
		}
	}

	return (
		<>
			<img className="shoppingBagIcon"
				onClick={() => setIsShoppingBagOpen(true)}
				src={shoppingbag}
				alt=''
			/>
			<span>{displayAmountOfItemsInCart()}</span>
		</>
	)
}
