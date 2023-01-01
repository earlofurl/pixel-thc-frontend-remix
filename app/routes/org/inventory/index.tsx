import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData, useNavigate } from '@remix-run/react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import React from 'react';
import { authenticator } from '~/auth.server';
import BasicGroupingTable from '~/components/tables/BasicGroupingTable';
import PackageTableRowActions from '~/components/tables/PackageTableRowActions';
import type { ActivePackageWithLabs } from '~/models/types/custom';
import { sessionStorage } from '~/services/session.server';

const tableTitle = 'Packages';
const tableDescription = 'List of all product inventory';
const columnHelper = createColumnHelper<ActivePackageWithLabs>();

type LoaderData = {
  packages: ActivePackageWithLabs[];
  error: { message: string } | null;
};

type TableRowActionsProps = {
  row: Row<ActivePackageWithLabs>;
};

const tableRowActions = (props: TableRowActionsProps) => (
  <PackageTableRowActions {...props} />
);

const tagNumberCellFormat = (tagNumber: string) => {
  if (tagNumber === '') {
    return <span>-</span>;
  }
  return <span className="fonts font-semibold">{tagNumber.slice(19, 24)}</span>;
};

const strainNameCellFormat = (strainName: string) => (
  <span className="fonts text-lg font-semibold">{strainName}</span>
);

const batchCodeCellFormat = (batchCode: string) => (
  <span className="fonts text-lg font-semibold">{batchCode}</span>
);

const quantityCellFormat = (quantity: number) => (
  <span className="fonts text-lg font-semibold">{quantity}</span>
);

const uomCellFormat = (uom: string) => (
  <span className="fonts text-lg font-semibold">{uom}</span>
);

export const loader = async ({ request }: LoaderArgs) => {
  const authResponse = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const error = session.get(authenticator.sessionErrorKey);
  session.set(authenticator.sessionKey, authResponse);

  const packagesResponse = await fetch(
    `${process.env.API_BASE_URL}/packages/active/all`,
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
  );
  const packages = await packagesResponse.json();

  return json<LoaderData>({ packages, error });
};

export default function InventoryIndex(): JSX.Element {
  const { packages, error } = useLoaderData();
  const navigate = useNavigate();

  function handleAddButtonClick() {
    navigate('create-package');
  }

  // Column structure for table
  const columnData: ColumnDef<ActivePackageWithLabs>[] = [
    columnHelper.display({
      id: 'actions',
      cell: (props) => tableRowActions({ row: props.row }),
      enableGrouping: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enableSorting: false,
    }),
    columnHelper.group({
      id: 'main',
      enableGrouping: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enableSorting: false,
      columns: [
        columnHelper.accessor('id', {
          id: 'id',
          header: 'ID',
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: false,
        }),
        columnHelper.accessor('tag_number', {
          id: 'tagNumber',
          header: 'Tag Number',
          cell: (info) => {
            const value = info.getValue() as string;
            return tagNumberCellFormat(value);
          },
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('strain_name', {
          id: 'strain',
          cell: (info) => {
            const value = info.getValue() as string;
            return strainNameCellFormat(value);
          },
          header: 'Strain',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
        columnHelper.accessor('batch_code', {
          id: 'testBatch',
          header: 'Batch',
          cell: (info) => {
            const value = info.getValue() as string;
            return batchCodeCellFormat(value);
          },
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
        columnHelper.accessor('product_form', {
          id: 'productForm',
          header: 'Form',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
        columnHelper.accessor('product_modifier', {
          id: 'productModifier',
          header: 'Modifier',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
        columnHelper.accessor('strain_type', {
          id: 'type',
          header: 'Type',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
      ],
    }),
    columnHelper.group({
      id: 'stock',
      enableGrouping: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enableSorting: false,
      columns: [
        columnHelper.accessor('quantity', {
          id: 'quantity',
          header: 'Quantity',
          cell: (info) => {
            const value = info.getValue() as number;
            return quantityCellFormat(value);
          },
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('uom_abbreviation', {
          id: 'uom',
          header: 'UOM',
          cell: (info) => {
            const value = info.getValue() as string;
            return uomCellFormat(value);
          },
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
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
        columnHelper.accessor('thc_total_percent', {
          id: 'thc',
          header: 'THC',
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbd_percent', {
          id: 'cbd',
          header: 'CBD',
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('terpene_total_percent', {
          id: 'terpenes',
          header: 'Terps',
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('total_cannabinoid_percent', {
          id: 'totalCannabinoids',
          header: 'Total Cannabinoids',
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
      ],
    }),
    columnHelper.group({
      id: 'etc',
      enableGrouping: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enableSorting: false,
      columns: [
        columnHelper.accessor('notes', {
          id: 'notes',
          header: 'Notes',
          enableGrouping: false,
          enableColumnFilter: false,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('location_name', {
          id: 'location_name',
          header: 'Location',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
      ],
    }),
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Page header */}
      <header className="flex flex-none items-center justify-between border-b border-gray-200 py-4 px-6">
        <div>
          <h1 className="text-lg font-semibold leading-6 text-gray-900">
            <span className="sm:hidden">Inventory</span>
            <span className="hidden sm:inline">Inventory</span>
          </h1>
        </div>
        <div className="flex items-center">
          <div className="hidden md:ml-4 md:flex md:items-center">
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <button
              type="button"
              onClick={handleAddButtonClick}
              className="ml-6 inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Create Package
            </button>
          </div>
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
            tableData={packages}
          />
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({
  error,
}: {
  readonly error: Error;
}): JSX.Element {
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Packages not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
