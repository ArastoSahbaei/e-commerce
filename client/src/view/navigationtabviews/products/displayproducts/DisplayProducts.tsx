import './DisplayProducts.css'
import { useEffect, useState, useContext } from 'react'
import APIService from '../../../../shared/api/service/APIService'
import { UserContext } from '../../../../shared/provider/UserProvider'
import { ToggleCartContext } from '../../../../shared/provider/ToggleCartProvider'
import { useHistory } from 'react-router-dom'
import RoutingPath from '../../../../routes/RoutingPath'

export const DisplayProducts = () => {
	const history = useHistory()
	const [products, setProducts] = useState<any>([])
	const [, setIsShoppingBagOpen] = useContext(ToggleCartContext)
	const [authenticatedUser, setAuthenticatedUser] = useContext<any>(UserContext)

	const fetchData = async () => {
		const { data } = await APIService.getAllProducts()
		setProducts(data)
	}

	useEffect(() => {
		fetchData()
	}, [])

	const addToCart = async (productId: string) => {
		try {
			const updatedCart = [...authenticatedUser?.shoppingCart[0]?.products, productId]
			await APIService.updateCart({
				cartId: authenticatedUser.shoppingCart[0]._id,
				products: updatedCart
			})
			setIsShoppingBagOpen(true)
			setAuthenticatedUser({ ...authenticatedUser, shoppingCart: [{ ...authenticatedUser.shoppingCart[0], products: updatedCart }] })
		} catch (error) {
			console.log(error)
		}
	}

	const displayData = () => {
		return products.map((x: any) =>
			<div className='displayProductWrapper' key={x?._id}>
				<div className='displayProductSubWrapper' onClick={() => history.push(RoutingPath.productDetailsView(x._id), x)}>
					<img className='productImg' src={'https://picsum.photos/200/200'} alt='' />
					<p>{x?.title}</p>
					<p>Brand Name</p>
					<p>{x?.price} kr</p>
				</div>
				<button className='addToCartButton' onClick={() => addToCart(x?._id)}>Lägg till i varukorg</button>
			</div>)
	}

	return (
		<div className='displayProductsContainer'>
			{/* <button>FILTRERA</button>
			<button>SORTERA</button> */}
			{displayData()}
		</div>
	)
}
