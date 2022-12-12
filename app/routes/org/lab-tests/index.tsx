import type { LoaderArgs } from '@remix-run/node'
import type { ActivePackageWithLabs } from '~/models/types/custom'
import { authenticator } from '~/auth.server'
import { SessionObject, sessionStorage } from '~/services/session.server'
import type { LabTest } from '~/models/types/standard'
import { json } from '@remix-run/node'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Outlet, useCatch, useLoaderData, useNavigate } from '@remix-run/react'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import React from 'react'
import BasicGroupingTable from '~/components/tables/BasicGroupingTable'
import PackageTableRowActions from '~/components/tables/PackageTableRowActions'

const tableTitle = 'Lab Tests'
const tableDescription = 'List of all lab tests'
const columnHelper = createColumnHelper<LabTest>()

type LoaderData = {
	labTests: LabTest[]
	error: { message: string } | null
}

export const loader = async ({ request }: LoaderArgs) => {
	const authResponse = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	const session = await sessionStorage.getSession(request.headers.get('Cookie'))
	const error = session.get(authenticator.sessionErrorKey)
	session.set(authenticator.sessionKey, authResponse)

	const labTestsResponse = await fetch(
		`${process.env.API_BASE_URL}/lab-tests`,
		{
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
			referrerPolicy: 'strict-origin-when-cross-origin',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authResponse.access_token}`,
			},
		},
	)
	const labTests = await labTestsResponse.json()

	return json<LoaderData>({ labTests, error })
}

export default function LabTestsIndex(): JSX.Element {
	const { labTests, error } = useLoaderData()
	const navigate = useNavigate()

	// Column structure for table
	const columnData: ColumnDef<LabTest>[] = [
		// columnHelper.display({
		// 	id: 'actions',
		// 	cell: (props) => (
		// 		<>
		// 			<div className="flex justify-center">
		// 				<PackageTableRowActions row={props.row} />
		// 			</div>
		// 		</>
		// 	),
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
				columnHelper.accessor('test_name', {
					id: 'test_name',
					header: () => <span>Name</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('batch_code', {
					id: 'testBatch',
					header: () => <span>Batch</span>,
					cell: (info) => {
						const value = info.getValue() as string

						return <span className="fonts font-semibold text-lg">{value}</span>
					},
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('test_id_code', {
					id: 'test_id_code',
					header: () => <span>Code</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('lab_facility_name', {
					id: 'lab_facility_name',
					header: () => <span>Facility Name</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('overall_passed', {
					id: 'overall_passed',
					header: () => <span>Passed?</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('thc_total_percent', {
					id: 'thc_total_percent',
					header: () => <span>THC%</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('thc_total_value', {
					id: 'thc_total_value',
					header: () => <span>THC mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbd_percent', {
					id: 'cbd_percent',
					header: () => <span>CBD%</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbd_value', {
					id: 'cbd_value',
					header: () => <span>CBD mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('terpene_total_percent', {
					id: 'terpene_total_percent',
					header: () => <span>Terp%</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('terpene_total_value', {
					id: 'terpene_total_value',
					header: () => <span>Terp mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('thc_a_percent', {
					id: 'thc_a_percent',
					header: () => <span>THC A%</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('thc_a_value', {
					id: 'thc_a_value',
					header: () => <span>THC A mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('delta9_thc_percent', {
					id: 'delta9_thc_percent',
					header: () => <span>Delta 9 THC %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('delta9_thc_value', {
					id: 'delta9_thc_value',
					header: () => <span>Delta 9 THC mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('delta8_thc_percent', {
					id: 'delta8_thc_percent',
					header: () => <span>Delta 8 THC %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('delta8_thc_value', {
					id: 'delta8_thc_value',
					header: () => <span>Delta 8 THC mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('thc_v_percent', {
					id: 'thc_v_percent',
					header: () => <span>THC V %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('thc_v_value', {
					id: 'thc_v_value',
					header: () => <span>THC V mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbd_a_percent', {
					id: 'cbd_a_percent',
					header: () => <span>CBD A %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbd_a_value', {
					id: 'cbd_a_value',
					header: () => <span>CBD A mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbn_percent', {
					id: 'cbn_percent',
					header: () => <span>CBN %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbn_value', {
					id: 'cbn_value',
					header: () => <span>CBN mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbg_a_percent', {
					id: 'cbg_a_percent',
					header: () => <span>CBG A %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbg_a_value', {
					id: 'cbg_a_value',
					header: () => <span>CBG A mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbg_percent', {
					id: 'cbg_percent',
					header: () => <span>CBG %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbg_value', {
					id: 'cbg_value',
					header: () => <span>CBG mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbc_percent', {
					id: 'cbc_percent',
					header: () => <span>CBC %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('cbc_value', {
					id: 'cbc_value',
					header: () => <span>CBC mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('total_cannabinoid_percent', {
					id: 'total_cannabinoid_percent',
					header: () => <span>Total Canna %</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
				columnHelper.accessor('total_cannabinoid_value', {
					id: 'total_cannabinoid_value',
					header: () => <span>Total Canna mg/g</span>,
					enableGrouping: true,
					enableColumnFilter: true,
					enableGlobalFilter: true,
					enableSorting: true,
				}),
			],
		}),
	]

	return (
		<div className="flex h-screen flex-col">
			{/* Page header */}
			<header className="flex flex-none items-center justify-between border-b border-gray-200 py-4 px-6">
				<div>
					<h1 className="text-lg font-semibold leading-6 text-gray-900">
						<span className="sm:hidden">Lab Tests</span>
						<span className="hidden sm:inline">Lab Tests</span>
					</h1>
				</div>
				<div className="flex items-center">
					{/*<div className="hidden md:ml-4 md:flex md:items-center">*/}
					{/*	<div className="ml-6 h-6 w-px bg-gray-300" />*/}
					{/*	<button*/}
					{/*		type="button"*/}
					{/*		onClick={handleAddButtonClick}*/}
					{/*		className="ml-6 inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">*/}
					{/*		<PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />*/}
					{/*		Create Package*/}
					{/*	</button>*/}
					{/*</div>*/}
				</div>
			</header>
			{error ? <div>Error: {error.message}</div> : null}
			{/* End Page Header */}
			<Outlet />
			<div className="space-y-2">
				<div className="m-2 bg-white shadow sm:overflow-hidden sm:rounded-lg">
					<BasicGroupingTable
						tableTitle={tableTitle}
						tableDescription={tableDescription}
						columnData={columnData}
						tableData={labTests}
					/>
				</div>
			</div>
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
		return <div>Lab Tests not found</div>
	}

	throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
