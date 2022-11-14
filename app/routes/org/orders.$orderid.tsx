import { PlusIcon } from '@heroicons/react/20/solid'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/solid'
import type { Order } from '~/models/types/prisma-model-types'
import type { LoaderFunction } from '@remix-run/node'
import { json, LoaderArgs } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import React from 'react'
import invariant from 'tiny-invariant'
import { PackageWithNestedData } from '~/models/types/custom'
import { authenticator } from '~/auth.server'
import { sessionStorage } from '~/services/session.server'
import BasicGroupingTable from '~/components/tables/BasicGroupingTable'
// import OrderLineItemTable from '~/components/tables/OrderLineItemTable'
// import OrderLineItemTableRowActions from '~/components/tables/OrderLineItemTableRowActions'
// import { useUoms } from '~/hooks/matches/use-uoms'
// import { requireAuthSession } from '~/modules/auth/guards'
// import type { AuthSession } from '~/modules/auth/session.server'
// import { getAllOrders } from '~/modules/order/queries'
// import { getAllPackagesOnOrder } from '~/modules/package/queries'

// TODO: streamline the amount of db calls needed to make a process
// Can likely restructure to pull data using matches.

// TODO: redo ui
// stat cards at top. narrow timeline underneath. table at bottom.

type LoaderData = {
	error: { message: string } | null
	order: Order
	packages: PackageWithNestedData[]
}

function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ')
}

export const loader = async ({ request, params }: LoaderArgs) => {
	await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	const cookieHeader = request.headers.get('Cookie')
	const session = await sessionStorage.getSession(cookieHeader)

	const error = session.get(
		authenticator.sessionErrorKey,
	) as LoaderData['error']

	const orderResponse = await fetch(
		`${process.env.API_BASE_URL}/api/v1/orders/${params.orderid}`,
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

	const packagesOnOrderResponse = await fetch(
		`${process.env.API_BASE_URL}/api/v1/packages/order/${params.orderid}`,
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

	const order = await orderResponse.json()
	const packages = await packagesOnOrderResponse.json()
	return json<LoaderData>({ order, packages, error })
}

// export const loader: LoaderFunction = async ({ request, params }) => {
// 	const authSession = await requireAuthSession(request, {
// 		onFailRedirectTo: '/login',
// 	})
// 	const orders = await getAllOrders()
// 	const orderPackages = await getAllPackagesOnOrder(params.toString())
// 	return json<LoaderData>({
// 		authSession,
// 		orders,
// 		orderPackages,
// 	})
// }

const tableTitle = 'Line Items'
const tableDescription = 'Line items on order'
const columnHelper = createColumnHelper<PackageWithNestedData>()

export default function SingleOrderPage() {
	// const uoms = useUoms()
	// const orders = useOrders();
	const { orderId } = useParams()
	// invariant(orderId, 'orderId is required')
	const { order, error, packages } = useLoaderData<LoaderData>()
	// const { orderPackages } = useLoaderData<LoaderData>()
	// const data = matches[2]!.data;

	// filter out order objects in data array to get single order that matches id
	// function findOrder(orderId: string) {
	// 	return orders.find((order: Order) => order.id === orderId)
	// }

	// get items from order, get price and quantity from each item, and sum them
	// function getTotal(order: OrderWithNesting) {
	//   return pipe(
	//     order.lineItemPackages,
	//     A.map((item: any) => item.ppuOnOrder * item.quantity),
	//     A.reduce(0, (acc, curr) => acc + curr)
	//   );
	// }

	// const order = findOrder(orderId)

	// const totalPrice = getTotal(order as OrderWithNesting);

	// Column structure for table
	const columnData: ColumnDef<PackageWithNestedData>[] = [
		// columnHelper.display({
		// 	id: 'actions',
		// 	cell: (props) => <OrderLineItemTableRowActions row={props.row} />,
		// 	enableGrouping: false,
		// 	enableColumnFilter: false,
		// 	enableGlobalFilter: false,
		// 	enableSorting: false,
		// }),
		columnHelper.group({
			id: 'main',
			enableGrouping: false,
			enableColumnFilter: false,
			enableGlobalFilter: false,
			enableSorting: false,
			columns: [
				columnHelper.accessor('id', {
					id: 'id',
					header: () => <span>ID</span>,
					enableGrouping: false,
					enableColumnFilter: false,
					enableGlobalFilter: false,
					enableSorting: false,
				}),
				columnHelper.accessor(
					(row: any) => (row.tag ? row.tag.tagNumber : 'No Tag'),
					{
						id: 'tagNumber',
						header: () => <span>Tag Number</span>,
						cell: (info) => {
							const value = info.getValue() as string
							if (value === '') {
								return <span>-</span>
							}
							return (
								<>
									<span>{value.slice(0, 19)}</span>
									<span className="fonts font-bold">{value.slice(19, 24)}</span>
								</>
							)
						},
						enableGrouping: false,
						enableColumnFilter: true,
						enableGlobalFilter: false,
						enableSorting: true,
					},
				),
				columnHelper.accessor(
					(row: any) => `${row.item.itemType?.productForm}`,
					{
						id: 'productForm',
						header: () => <span>Form</span>,
						enableGrouping: true,
						enableColumnFilter: true,
						enableGlobalFilter: true,
						enableSorting: true,
					},
				),
				columnHelper.accessor(
					(row: any) => `${row.item.itemType?.productModifier}`,
					{
						id: 'productModifier',
						header: () => <span>Modifier</span>,
						enableGrouping: true,
						enableColumnFilter: true,
						enableGlobalFilter: true,
						enableSorting: true,
					},
				),
				columnHelper.accessor((row: any) => `${row.item.strain?.name}`, {
					id: 'strain',
					header: () => <span>Strain</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor(
					(row: any) => `${row.labTests[0]?.labTest.batchCode}`,
					{
						id: 'testBatch',
						header: () => <span>Batch</span>,
						enableGrouping: true,
						enableColumnFilter: true,
						enableGlobalFilter: true,
						enableSorting: true,
					},
				),
				columnHelper.accessor((row: any) => `${row.item.strain?.type}`, {
					id: 'type',
					header: () => <span>Type</span>,
					enableGrouping: false,
					enableColumnFilter: false,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
			],
		}),
		columnHelper.group({
			id: 'stats',
			enableGrouping: false,
			enableColumnFilter: false,
			enableGlobalFilter: false,
			enableSorting: false,
			columns: [
				columnHelper.accessor(
					(row: any) => `${row.labTests[0]?.labTest.thcTotalPercent}`,
					{
						id: 'thc',
						header: () => <span>THC</span>,
						enableGrouping: false,
						enableColumnFilter: false,
						enableGlobalFilter: false,
						enableSorting: true,
					},
				),
			],
		}),
		columnHelper.group({
			id: 'count',
			enableGrouping: false,
			enableColumnFilter: false,
			enableGlobalFilter: false,
			enableSorting: false,
			columns: [
				columnHelper.accessor('quantity', {
					id: 'quantity',
					header: () => <span>Quantity</span>,
					enableGrouping: false,
					enableColumnFilter: false,
					enableGlobalFilter: false,
					enableSorting: true,
				}),
				columnHelper.accessor((row: any) => row.uom?.name, {
					id: 'uom',
					header: () => <span>UoM</span>,
					enableGrouping: false,
					enableColumnFilter: false,
					enableGlobalFilter: false,
					enableSorting: true,
				}),
				columnHelper.accessor('ppuOnOrder', {
					id: 'ppuOnOrder',
					header: () => <span>PPU</span>,
					cell: (info) => {
						const value = info.getValue()
						if (value === '') {
							return <span>-</span>
						}
						return (
							<span>
								{new Intl.NumberFormat('en-US', {
									style: 'currency',
									currency: 'USD',
								}).format(value)}
							</span>
						)
					},
					enableGrouping: false,
					enableColumnFilter: false,
					enableGlobalFilter: false,
					enableSorting: true,
				}),
				columnHelper.accessor(
					(row: any) => {
						return row.ppuOnOrder * row.quantity
					},
					{
						id: 'lineSubTotal',
						header: () => <span>SubTotal</span>,
						cell: (info) => {
							const value = info.getValue()
							if (value === '') {
								return <span>-</span>
							}
							return (
								<span>
									{new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD',
									}).format(value)}
								</span>
							)
						},
						enableGrouping: false,
						enableColumnFilter: false,
						enableGlobalFilter: false,
						enableSorting: true,
					},
				),
			],
		}),
	]

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Content area */}
			<div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white">
				<div className="lg:relative lg:flex">
					{/* Content */}
					<div className="max-w-9xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
						{/* Page header */}
						<div className="mb-5 sm:flex sm:items-center sm:justify-between">
							{/* Left: Title */}
							<div className="mb-4 sm:mb-0">
								<h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
									{order?.customerName}
								</h1>
							</div>

							{/* Add Item button */}
							<button
								type="button"
								className="inline-flex items-center rounded-md border border-transparent bg-indigo-500 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
								<PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
								Add Item
							</button>
						</div>
						{/* Filters */}
						<div className="mb-5">
							<ul className="-m-1 flex flex-wrap">
								<li className="m-1">
									<button className="inline-flex items-center justify-center rounded-full border border-transparent bg-indigo-500 px-3 py-1 text-sm font-medium leading-5 text-white shadow-sm duration-150 ease-in-out">
										View All
									</button>
								</li>
								<li className="m-1">
									<button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium leading-5 text-slate-500 shadow-sm duration-150 ease-in-out hover:border-slate-300">
										Open Items
									</button>
								</li>
								<li className="m-1">
									<button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium leading-5 text-slate-500 shadow-sm duration-150 ease-in-out hover:border-slate-300">
										Completed Items
									</button>
								</li>
							</ul>
						</div>
						{/*Line Items*/}
						<div className="max-w-full space-y-2">
							<div className="m-2 bg-white shadow sm:rounded-lg">
								<BasicGroupingTable
									tableTitle={tableTitle}
									tableDescription={tableDescription}
									columnData={columnData}
									tableData={packages}
								/>
							</div>
						</div>
					</div>

					{/* Order Overview Sidebar */}
					<div>
						<div className="no-scrollbar border-t border-slate-200 bg-slate-50 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:w-[390px] lg:shrink-0 lg:overflow-y-auto lg:overflow-x-hidden lg:border-t-0 lg:border-l">
							<div className="py-8 px-4 lg:px-8">
								<div className="mx-auto max-w-sm lg:max-w-none">
									{/* Details */}
									<div className="mt-6">
										<div className="mb-1 text-sm font-semibold text-slate-800">
											Details
										</div>
										<ul>
											<li className="flex items-center justify-between border-b border-slate-200 py-3">
												<div className="text-sm">Customer Name</div>
												<div className="ml-2 text-sm font-medium text-slate-800">
													{order?.customerName}
												</div>
											</li>
											<li className="flex items-center justify-between border-b border-slate-200 py-3">
												<div className="text-sm">Status</div>
												<div className="flex items-center whitespace-nowrap">
													<div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
													<div className="text-sm font-medium text-slate-800">
														{order?.status}
													</div>
												</div>
											</li>
										</ul>
									</div>

									{/* Detail Zone 1 */}
									<div className="mt-6">
										<div className="mb-4 text-sm font-semibold text-slate-800">
											Pack Date
										</div>
										<div className="border-b border-slate-200 pb-4">
											<div className="mb-2 flex justify-between text-sm">
												<div>
													{dayjs(order?.scheduledPackDateTime).format(
														'MMM DD YY',
													)}
												</div>
											</div>
										</div>
									</div>

									{/* Detail Zone 2 */}
									<div className="mt-6">
										<div className="mb-4 text-sm font-semibold text-slate-800">
											Ship Date
										</div>
										<div className="border-b border-slate-200 pb-4">
											<div className="mb-2 flex justify-between text-sm">
												<div>
													{dayjs(order?.scheduledShipDateTime).format(
														'MMM DD YY',
													)}
												</div>
											</div>
										</div>
									</div>

									{/* Edit / Delete */}
									<div className="mt-6 flex items-center space-x-3">
										<div className="w-1/2">
											<button
												type="button"
												className="inline-flex items-center rounded-md border border-transparent bg-indigo-500 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
												<PencilIcon
													className="-ml-0.5 mr-2 h-4 w-4"
													aria-hidden="true"
												/>
												Edit Order
											</button>
										</div>
										<div className="w-1/2">
											<button
												type="button"
												className="inline-flex items-center rounded-md border border-transparent bg-red-500 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
												<XMarkIcon
													className="-ml-0.5 mr-2 h-4 w-4"
													aria-hidden="true"
												/>
												Cancel Order
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
