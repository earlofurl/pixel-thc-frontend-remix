import { Menu, Transition } from '@headlessui/react'
import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisHorizontalIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid'
import type { Order } from '~/models/types/prisma-model-types'
import type { LoaderFunction } from '@remix-run/node'
import { json, LoaderArgs } from '@remix-run/node'
import { Link, useCatch, useLoaderData, useNavigate } from '@remix-run/react'
import dayjs from 'dayjs'
import React, { Fragment } from 'react'
import Calendar from 'react-calendar'
import { authenticator } from '~/auth.server'
import { sessionStorage } from '~/services/session.server'
// import { requireAuthSession } from '~/modules/auth/guards'
// import type { AuthSession } from '~/modules/auth/session.server'
// import { getAllOrders } from '~/modules/order/queries/get-orders.server'

type LoaderData = {
	error: { message: string } | null
	orders: Order[]
}

function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ')
}

export const loader = async ({ request }: LoaderArgs) => {
	await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	const cookieHeader = request.headers.get('Cookie')
	const session = await sessionStorage.getSession(cookieHeader)

	const error = session.get(
		authenticator.sessionErrorKey,
	) as LoaderData['error']

	const ordersResponse = await fetch(
		`${process.env.API_BASE_URL}/api/v1/orders`,
		{
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
			referrerPolicy: 'strict-origin-when-cross-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: await session.data.user,
			},
		},
	)

	const orders = await ordersResponse.json()
	return json<LoaderData>({ orders, error })
}

export default function OrderPage(): JSX.Element {
	const { error, orders } = useLoaderData<LoaderData>()
	const navigate = useNavigate()
	const [dateValue, setDateValue] = React.useState(new Date())

	function handleAddButtonClick(): undefined {
		navigate('add')
		return undefined
	}

	return (
		<div className="flex h-screen flex-col">
			{/* Page header */}
			<header className="flex flex-none items-center justify-between border-b border-gray-200 py-4 px-6">
				<div>
					<h1 className="text-lg font-semibold leading-6 text-gray-900">
						<span className="sm:hidden">Orders</span>
						<span className="hidden sm:inline">Orders</span>
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						{orders?.length} Open Orders
					</p>
				</div>
				<div className="flex items-center">
					<div className="flex items-center rounded-md shadow-sm md:items-stretch">
						<button
							type="button"
							className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50">
							<span className="sr-only">Previous month</span>
							<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
						</button>
						<button
							type="button"
							className="hidden border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:block">
							Today
						</button>
						<span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
						<button
							type="button"
							className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50">
							<span className="sr-only">Next month</span>
							<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
					<div className="hidden md:ml-4 md:flex md:items-center">
						<Menu as="div" className="relative">
							<Menu.Button
								type="button"
								className="flex items-center rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
								Day view
								<ChevronDownIcon
									className="ml-2 h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							</Menu.Button>

							<Transition
								as={Fragment}
								enter="transition ease-out duration-100"
								enterFrom="transform opacity-0 scale-95"
								enterTo="transform opacity-100 scale-100"
								leave="transition ease-in duration-75"
								leaveFrom="transform opacity-100 scale-100"
								leaveTo="transform opacity-0 scale-95">
								<Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="py-1">
										<Menu.Item>
											{({ active }) => (
												<a
													href="#"
													className={classNames(
														active
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-700',
														'block px-4 py-2 text-sm',
													)}>
													Day view
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													href="#"
													className={classNames(
														active
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-700',
														'block px-4 py-2 text-sm',
													)}>
													Week view
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													href="#"
													className={classNames(
														active
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-700',
														'block px-4 py-2 text-sm',
													)}>
													Month view
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													href="#"
													className={classNames(
														active
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-700',
														'block px-4 py-2 text-sm',
													)}>
													Year view
												</a>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
						<div className="ml-6 h-6 w-px bg-gray-300" />
						<button
							type="button"
							className="ml-6 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
							Add order
						</button>
					</div>
					<Menu as="div" className="relative ml-6 md:hidden">
						<Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
							<span className="sr-only">Open menu</span>
							<EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
						</Menu.Button>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95">
							<Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active
														? 'bg-gray-100 text-gray-900'
														: 'text-gray-700',
													'block px-4 py-2 text-sm',
												)}>
												Create order
											</a>
										)}
									</Menu.Item>
								</div>
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active
														? 'bg-gray-100 text-gray-900'
														: 'text-gray-700',
													'block px-4 py-2 text-sm',
												)}>
												Go to today
											</a>
										)}
									</Menu.Item>
								</div>
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active
														? 'bg-gray-100 text-gray-900'
														: 'text-gray-700',
													'block px-4 py-2 text-sm',
												)}>
												Day view
											</a>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active
														? 'bg-gray-100 text-gray-900'
														: 'text-gray-700',
													'block px-4 py-2 text-sm',
												)}>
												Week view
											</a>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active
														? 'bg-gray-100 text-gray-900'
														: 'text-gray-700',
													'block px-4 py-2 text-sm',
												)}>
												Month view
											</a>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active
														? 'bg-gray-100 text-gray-900'
														: 'text-gray-700',
													'block px-4 py-2 text-sm',
												)}>
												Year view
											</a>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</header>
			{/* End Page Header */}

			{/* Page Content */}
			<div className="isolate flex flex-auto overflow-hidden bg-white">
				<div className="flex flex-auto flex-col overflow-auto">
					{/* Mobile Day Picker*/}
					{/* TODO: Mobile Day Picker is using constant placeholder values. */}
					<div className="sticky top-0 z-10 grid flex-none grid-cols-7 bg-white text-xs text-gray-500 shadow ring-1 ring-black ring-opacity-5 md:hidden">
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>W</span>
							{/* Default: "text-gray-900", Selected: "bg-gray-900 text-white", Today (Not Selected): "text-indigo-600", Today (Selected): "bg-indigo-600 text-white" */}
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-gray-900">
								19
							</span>
						</button>
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>T</span>
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-indigo-600">
								20
							</span>
						</button>
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>F</span>
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-gray-900">
								21
							</span>
						</button>
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>S</span>
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-base font-semibold text-white">
								22
							</span>
						</button>
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>S</span>
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-gray-900">
								23
							</span>
						</button>
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>M</span>
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-gray-900">
								24
							</span>
						</button>
						<button
							type="button"
							className="flex flex-col items-center pt-3 pb-1.5">
							<span>T</span>
							<span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-gray-900">
								25
							</span>
						</button>
					</div>
					{/* End Mobile Day Picker*/}

					{/* Order List */}
					<div className="flex w-full flex-auto">
						<div className="w-14 flex-none bg-white ring-1 ring-gray-100" />
						<div className="grid flex-auto grid-cols-1 grid-rows-1">
							<div
								className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
								style={{
									gridTemplateRows: 'repeat(auto-fill, minmax(3.5rem, 1fr))',
								}}>
								{/* Events */}
								<ul className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 divide-y divide-gray-200">
									{}
									{orders.map((order: Order) => (
										<li key={order.id} className="relative mt-1.5 flex">
											<Link
												to={order.id}
												className="block rounded-md bg-gradient-to-r from-slate-100 to-white p-2 hover:from-blue-100 hover:to-blue-50">
												<div className="flex items-center px-4 py-4 sm:px-6">
													<div className="flex min-w-0 flex-1 items-center">
														<div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
															<div>
																<p className="truncate text-xl font-semibold text-gray-700">
																	{order.customerName
																		? order.customerName
																		: '-'}
																</p>
																{/* <p className="mt-2 flex items-center text-sm text-gray-500">*/}
																{/*  <LocationMarkerIcon*/}
																{/*    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"*/}
																{/*    aria-hidden="true"*/}
																{/*  />*/}
																{/*  <span className="truncate">*/}
																{/*    {order.customerFacility.addressStreet1*/}
																{/*      ? order.customerFacility.addressStreet1*/}
																{/*      : "-"}{" "}*/}
																{/*    {order.customerFacility.addressCity*/}
																{/*      ? order.customerFacility.addressCity*/}
																{/*      : "-"}{" "}*/}
																{/*    {order.customerFacility.addressState*/}
																{/*      ? order.customerFacility.addressState*/}
																{/*      : "-"}*/}
																{/*  </span>*/}
																{/* </p>*/}
															</div>
															<div className="hidden md:block">
																<div>
																	<p className="text-sm text-gray-900">
																		Scheduled for{' '}
																		<time
																			className="text-md font-semibold text-gray-700"
																			dateTime={dayjs(
																				order.scheduledDeliveryDateTime,
																			).format('MMM DD YYYY')}>
																			{dayjs(
																				order.scheduledDeliveryDateTime,
																			).format('MMM DD YYYY')}
																		</time>
																	</p>
																	<p className="mt-2 flex items-center text-sm text-gray-500">
																		<QuestionMarkCircleIcon
																			className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400"
																			aria-hidden="true"
																		/>
																		<span
																			className={classNames(
																				'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
																				order.status === 'Open'
																					? 'bg-yellow-100 text-yellow-800'
																					: order.status === 'Packed'
																					? 'bg-green-100 text-green-800'
																					: order.status === 'Shipped'
																					? 'bg-blue-100 text-blue-800'
																					: order.status === 'Delivered'
																					? 'bg-blue-100 text-blue-800'
																					: order.status === 'Cancelled'
																					? 'bg-red-100 text-red-800'
																					: order.status === 'Paid'
																					? 'bg-green-100 text-green-800'
																					: order.status === 'Finished'
																					? 'bg-gray-100 text-gray-800'
																					: 'bg-gray-100 text-gray-900',
																			)}>
																			{order.status}
																		</span>
																	</p>
																</div>
															</div>
														</div>
													</div>
													<div>
														<ChevronRightIcon
															className="h-5 w-5 text-gray-400"
															aria-hidden="true"
														/>
													</div>
												</div>
											</Link>
										</li>
									))}
								</ul>
								{/*  End Events*/}
							</div>
						</div>
					</div>
				</div>

				{/* Calendar */}
				<div className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 py-10 px-8 md:block">
					<Calendar
						onChange={setDateValue}
						value={dateValue}
						className="border-1 border-gray-100 p-4 text-center text-lg font-medium leading-5 text-gray-900"
						tileClassName="max-w-full p-2 text-center leading-4"
						nextLabel={<ChevronRightIcon className="h-5 w-5 text-gray-500" />}
						prevLabel={<ChevronLeftIcon className="h-5 w-5 text-gray-500" />}
						next2Label={
							<ChevronDoubleRightIcon className="h-5 w-5 text-gray-500" />
						}
						prev2Label={
							<ChevronDoubleLeftIcon className="h-5 w-5 text-gray-500" />
						}
						navigationLabel={({ label }: { label: string }): JSX.Element => (
							<div className="mb-2 p-2 text-xl">{label}</div>
						)}
					/>
				</div>
				{/* End Calendar */}
			</div>
			{/*  End Page Content */}
		</div>
	)
}

export function ErrorBoundary({
	error,
}: {
	readonly error: Error
}): JSX.Element {
	// console.error(error);

	return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary(): JSX.Element {
	const caught = useCatch()

	if (caught.status === 404) {
		return <div>Orders not found</div>
	}

	throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
