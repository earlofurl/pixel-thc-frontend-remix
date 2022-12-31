import { Popover, Transition } from '@headlessui/react';
import {
	RectangleGroupIcon,
	RectangleStackIcon,
} from '@heroicons/react/20/solid';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useCatch } from '@remix-run/react';
import {
	compareItems,
	type RankingInfo,
	rankItem,
} from '@tanstack/match-sorter-utils';
import type { ColumnDef } from '@tanstack/react-table';
import {
	type Column,
	type ColumnFiltersState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getGroupedRowModel,
	getSortedRowModel,
	type GroupingState,
	type SortingFn,
	sortingFns,
	type SortingState,
	type Table,
	useReactTable,
} from '@tanstack/react-table';
import React, { Fragment } from 'react';

declare module '@tanstack/table-core' {
	type FilterFns = {
		fuzzy: FilterFn<unknown>;
	};

	type FilterMeta = {
		itemRank: RankingInfo;
	};
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
	// Rank the item
	const itemRank = rankItem(row.getValue(columnId), value);

	// Store the itemRank info
	addMeta({
		itemRank,
	});

	// Return if the item should be filtered in/out
	return itemRank.passed;
};

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
	let dir = 0;

	// Only sort by rank if the column has ranking information
	if (rowA.columnFiltersMeta[columnId]) {
		dir = compareItems(
			rowA.columnFiltersMeta[columnId]?.itemRank!,
			rowB.columnFiltersMeta[columnId]?.itemRank!,
		);
	}

	// Provide an alphanumeric fallback for when the item ranks are equal
	return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export default function BasicGroupingTable({
	tableTitle,
	tableDescription,
	columnData,
	tableData,
}): JSX.Element {
	const columns: readonly ColumnDef<object>[] = React.useMemo(() => {
		return columnData;
	}, [columnData]);

	const data: readonly object[] = React.useMemo(() => {
		return tableData;
	}, [tableData]);
	
	const [grouping, setGrouping] = React.useState<GroupingState>([]);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [globalFilter, setGlobalFilter] = React.useState('');
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		initialState: {
			columnVisibility: {
				id: true,
			},
		},
		state: {
			grouping,
			columnFilters,
			globalFilter,
			sorting,
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: fuzzyFilter,
		getFilteredRowModel: getFilteredRowModel(),
		onGroupingChange: setGrouping,
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
	});

	return (
		<div className="px-2 sm:px-3 lg:px-4">
			{/* Table Title Bar */}
			<div className="sm:flex sm:items-center lg:px-2">
				<div className="sm:flex-auto">
					<h1 className="text-xl font-semibold text-gray-900">{tableTitle}</h1>
					{/* <p className='mt-2 text-sm text-gray-700'>{tableDescription}</p> */}
				</div>
				<Popover className="relative inline-block text-left">
					<Popover.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
						Columns
						<ChevronDownIcon
							className="-mr-1 ml-2 h-5 w-5"
							aria-hidden="true"
						/>
					</Popover.Button>

					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95">
						<Popover.Panel className="z-60 absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						</Popover.Panel>
					</Transition>
				</Popover>
			</div>
			{/* Table */}
			<div className="my-4 flex flex-col">
				<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
						<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
							<div>
								<DebouncedInput
									value={globalFilter ?? ''}
									onChange={(value) => { setGlobalFilter(String(value)); }}
									className="font-lg border-block border p-2 shadow"
									placeholder="Search all columns..."
								/>
							</div>
							<table className="min-w-full divide-y divide-gray-300">
								{/* Table headers */}
								<thead className="bg-gray-50">
									{table.getHeaderGroups().map((headerGroup) => (
										<tr key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<th
													key={header.id}
													className="px-2 py-2 text-left text-sm font-semibold text-gray-900"
													colSpan={header.colSpan}>
													<div className="px-2 py-2 text-left text-sm font-semibold text-gray-900">
														{header.column.getCanGroup() ? (
															// If the header can be grouped, let's add a toggle
															<button
																type="button"
																{...{
																	onClick:
																		header.column.getToggleGroupingHandler(),
																	style: {
																		cursor: 'pointer',
																	},
																}}>
																{header.column.getIsGrouped() ? (
																	<RectangleStackIcon className="h-4 w-4" />
																) : (
																	<RectangleGroupIcon className="h-4 w-4" />
																)}
															</button>
														) : null}{' '}
														<div
															{...{
																className: header.column.getCanSort()
																	? 'cursor-pointer select-none'
																	: '',
																onClick:
																	header.column.getToggleSortingHandler(),
															}}>
															{flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
															{{
																asc: ' 🔼',
																desc: ' 🔽',
															}[header.column.getIsSorted() as string] ?? null}
														</div>
														{header.column.getCanFilter() ? (
															<div>
																<Filter column={header.column} table={table} />
															</div>
														) : null}
													</div>
												</th>
											))}
											{/* Actions Header */}
											<th scope="col" className="relative px-2 py-2">
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									))}
								</thead>
								{/* Table body */}
								<tbody className="divide-y divide-gray-200 bg-white">
									{table.getRowModel().rows.map((row, rowIdx) => (
										<tr
											{...{
												className:
													rowIdx % 2 === 0
														? 'whitespace-nowrap px-2 py-3.5 text-sm font-medium text-gray-900'
														: 'whitespace-nowrap px-2 py-3.5 text-sm font-medium text-gray-900 bg-gray-50',
											}}
											key={row.id}>
											{row.getVisibleCells().map((cell) => (
												<td
													key={cell.id}
													className="whitespace-nowrap px-2 py-3.5 text-sm font-medium text-gray-900">
													{cell.getIsGrouped() ? (
														// If it's a grouped cell, add an expander and row count
														<button
																type="button"
																{...{
																	onClick: row.getToggleExpandedHandler(),
																	style: {
																		cursor: row.getCanExpand()
																			? 'pointer'
																			: 'normal',
																	},
																}}>
																{row.getIsExpanded() ? '👇' : '👉'}{' '}
																{flexRender(
																	cell.column.columnDef.cell,
																	cell.getContext(),
																)}{' '}
																({row.subRows.length})
															</button>
													) : cell.getIsAggregated() ? (
														// If the cell is aggregated, use the Aggregated
														// renderer for cell
														flexRender(
															cell.column.columnDef.aggregatedCell ??
																cell.column.columnDef.cell,
															cell.getContext(),
														)
													) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
														// Otherwise, just render the regular cell
														flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)
													)}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function Filter({
	column,
	table,
}: {
	column: Column<any, unknown>;
	table: Table<any>;
}) {
	const firstValue = table
		.getPreFilteredRowModel()
		.flatRows[0]?.getValue(column.id);

	const columnFilterValue = column.getFilterValue();

	const sortedUniqueValues = React.useMemo(
		() =>
			typeof firstValue === 'number'
				? []
				: Array.from(column.getFacetedUniqueValues().keys()).sort(),
		[column.getFacetedUniqueValues()],
	);

	return typeof firstValue === 'number' ? (
		<div>
			<div className="flex space-x-2">
				<DebouncedInput
					type="number"
					min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
					max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
					value={(columnFilterValue as [number, number])?.[0] ?? ''}
					onChange={(value) =>
						column.setFilterValue((old: [number, number]) => [value, old?.[1]])
					}
					placeholder={`Min ${
						column.getFacetedMinMaxValues()?.[0]
							? `(${column.getFacetedMinMaxValues()?.[0]})`
							: ''
					}`}
					className="relative block w-full rounded-none rounded-bl-md border-gray-300 bg-transparent focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
				<DebouncedInput
					type="number"
					min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
					max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
					value={(columnFilterValue as [number, number])?.[1] ?? ''}
					onChange={(value) =>
						column.setFilterValue((old: [number, number]) => [old?.[0], value])
					}
					placeholder={`Max ${
						column.getFacetedMinMaxValues()?.[1]
							? `(${column.getFacetedMinMaxValues()?.[1]})`
							: ''
					}`}
					className="relative block w-full rounded-none rounded-bl-md border-gray-300 bg-white focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			<div className="h-1" />
		</div>
	) : (
		<>
			<datalist id={column.id + 'list'}>
				{sortedUniqueValues.slice(0, 5000).map((value: any) => (
					<option value={value} key={value} />
				))}
			</datalist>
			<DebouncedInput
				type="text"
				value={(columnFilterValue ?? '') as string}
				onChange={(value) => column.setFilterValue(value)}
				placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
				className="relative block w-full rounded-none rounded-bl-md border-gray-300 bg-white focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				list={column.id + 'list'}
			/>
			<div className="h-1" />
		</>
	);
}

// A debounced input react component
function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
	const [value, setValue] = React.useState(initialValue);

	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [value]);

	return (
		<input
			{...props}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
}

export function ErrorBoundary({ error }: { error: Error }): JSX.Element {
	return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
	const caught = useCatch();

	if (caught.status === 404) {
		return <div>Table not found</div>;
	}

	throw new Error(
		`Unexpected caught response with status: ${caught.status}`,
	);
}
