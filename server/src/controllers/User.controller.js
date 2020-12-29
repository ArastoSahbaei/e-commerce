import jwt from 'jsonwebtoken'
import passport from 'passport'
import UserModel from '../models/User.model.js'
import StatusCode from '../../configurations/StatusCode.js'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const authenticatedRoute = async (request, response) => {
	jwt.verify(request.token, 'jwtSecret.secret', (error, authorizedData) => {
		if (error) {
			//If error send Forbidden (403)
			response.status(StatusCode.FORBIDDEN).send({ message: `error: ${error}` })
		} else {
			//If token is successfully verified, we can send the autorized data 
			response.json({
				message: 'Successful log in',
				authorizedData
			})
		}
	})
}

const login = async (request, response, next) => {
	passport.authenticate('login', (err, users, info) => {
		/* 	if (err) { console.error(`error ${err}`) } */
		if (info !== undefined) {
			info.message === 'bad username'
				? response.status(StatusCode.UNAUTHORIZED).send(info.message)
				: response.status(StatusCode.FORBIDDEN).send(info.message)
		} else {
			request.logIn(users, () => {
				UserModel.findOne({ username: request.body.username })
					.then(user => {
						const token = jwt.sign({ id: user._id }, 'jwtSecret.secret', { expiresIn: 60 * 60 })
						response.status(200).send({
							authenticated: true,
							token,
							username: user.username,
							id: user._id
						})
					})
			})
		}
	})(request, response, next)
}

const registerNewUser = async (request, response, next) => {
	passport.authenticate('register', (err, user, info) => {
		/* if (err) { console.error(err) } */
		if (info !== undefined) {
			response.status(StatusCode.FORBIDDEN).send(info.message)
		} else {
			request.logIn(user, error => {
				const data = {
					username: request.body.username,
					email: request.body.email
				}
				UserModel.findOne({ where: data.username })
					.then(user => {
						console.log('THIS IS LE USER:', user)
						UserModel.update({
							username: data.username,
							email: data.email
						}).then(() => {
							response.status(StatusCode.CREATED).send(data)
						})
					})
			})
		}
	})(request, response, next)


	/* 	const user = new UserModel({
			username: request.body.username,
			password: request.body.password
		})
	
		try {
			const databaseResponse = await user.save()
			response.status(StatusCode.CREATED).send(databaseResponse)
		} catch (error) {
			response.status(StatusCode.INTERNAL_SERVER_ERROR).send({ message: error.message })
		} */
}

const getAllUsers = async (request, response) => {
	try {
		const databaseResponse = await UserModel.find()
		response.status(StatusCode.OK).send(databaseResponse)
	} catch (error) {
		response.status(StatusCode.INTERNAL_SERVER_ERROR).send({ message: error.message })
	}
}

const getUserWithID = async (request, response) => {
	try {
		const databaseResponse = await UserModel.findById(request.params.userId)
		response.status(StatusCode.OK).send(databaseResponse)
	} catch (error) {
		response.status(StatusCode.INTERNAL_SERVER_ERROR).send({
			message: 'Error occured while trying to retrieve user with ID: ' + request.params.userId,
			error: error.message
		})
	}
}

const getUserWithQuery = async (request, response) => {
	try {
		const databaseResponse = await UserModel.find({ username: request.query.username })
		databaseResponse.length !== 0
			? response.status(StatusCode.OK).send(databaseResponse)
			: response.status(StatusCode.NOT_FOUND).send({ message: 'Could not find user with username ' + request.query.username })
	} catch (error) {
		response.status(StatusCode.INTERNAL_SERVER_ERROR).send({
			message: 'Error occured while trying to retrieve user with username: ' + request.query.userId,
			error: error.message
		})
	}
}

const updateValuesOfExistingUser = async (request, response) => {
	try {
		if (!request.body) { return response.status(StatusCode.BAD_REQUEST).send({ message: 'Empty values were sent' }) }
		const databaseResponse = await UserModel.findByIdAndUpdate(request.params.userId, {
			username: request.body.username,
			password: request.body.password
		}, { new: true })
		response.status(StatusCode.OK).send(databaseResponse)
	} catch (error) {
		response.status(StatusCode.INTERNAL_SERVER_ERROR).send({
			message: 'Error occured while trying to update values of the user with ID: ' + request.params.userId,
			error: error.message
		})
	}
}

const deleteUserWithID = async (request, response) => {
	try {
		const databaseResponse = await UserModel.findByIdAndDelete(request.params.userId)
		response.status(StatusCode.OK).send({ message: `Sucessfully deleted the USER with username: ${databaseResponse.username} and ID: ${request.params.userId}` })
	} catch (error) {
		response.status(StatusCode.INTERNAL_SERVER_ERROR).send({
			message: `Error occured while trying to delete user with the ID: ${request.params.userId}`,
			error: error.message
		})
	}
}

const test = (request, response) => {
	if (request.body.email === '') {
		response.status(400).send('email required')
	}
	console.error(request.body.email)
	UserModel.findOne({
		email: request.body.email
	}).then((user) => {
		if (user === null) {
			console.error('email not in database')
			response.status(403).send('email not in db')
		} else {
			const token = crypto.randomBytes(20).toString('hex')
			user.update({
				resetPasswordToken: token,
				resetPasswordExpires: Date.now() + 3600000,
			})

			const transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true,
				auth: {
					type: 'OAuth2',
					user: 'developmentwitharre@gmail.com',
					clientId: '180730641849-0ivdiknhfcu9pmq89kejivmpr3h02tf5.apps.googleusercontent.com',
					clientSecret: 'm89T-wOPvO_8vIABpOKOh4fx',
					refreshToken: '1//042tb0cmHO1sdCgYIARAAGAQSNwF-L9IryiL37nTmc3lqlXHwLZzSHyXO1ZFZ346roUC1L8TbRD37FJgU1Y3GSgQaIagnQDrMgBM'
				},
			})

			const mailOptions = {
				from: 'developmentwitharre@gmail.com',
				to: `${user.email}`,
				subject: 'Link To Reset Password',
				text:
					'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
					+ 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
					+ `http://localhost:3031/reset/${token}\n\n`
					+ 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
			}

			console.log('sending mail')

			transporter.sendMail(mailOptions, (error, response) => {
				if (error) {
					console.error('there was an error: ', error)
				} else {
					console.log('here is the response: ', response)
					response.status(200).send(response)
				}
			})
		}
	})
}

export default {
	authenticatedRoute,
	login,
	registerNewUser,
	getAllUsers,
	getUserWithID,
	getUserWithQuery,
	updateValuesOfExistingUser,
	deleteUserWithID,
	test
}