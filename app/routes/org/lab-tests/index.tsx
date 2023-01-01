import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData, useNavigate } from '@remix-run/react';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import React from 'react';
import { authenticator } from '~/auth.server';
import BasicGroupingTable from '~/components/tables/BasicGroupingTable';
import type { LabTest } from '~/models/types/standard';
import { sessionStorage } from '~/services/session.server';

const tableTitle = 'Lab Tests';
const tableDescription = 'List of all lab tests';
const columnHelper = createColumnHelper<LabTest>();

const batchCodeCellFormat = (batchCode: string) => (
  <span className="fonts text-lg font-semibold">{batchCode}</span>
);

type LoaderData = {
  labTests: LabTest[];
  error: { message: string } | null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const authResponse = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const error = session.get(authenticator.sessionErrorKey);
  session.set(authenticator.sessionKey, authResponse);

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
  );
  const labTests = await labTestsResponse.json();

  return json<LoaderData>({ labTests, error });
};

export default function LabTestsIndex(): JSX.Element {
  const { labTests, error } = useLoaderData();
  const navigate = useNavigate();

  // Column structure for table
  const columnData: ColumnDef<LabTest>[] = [
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
          enableSorting: true,
        }),
        columnHelper.accessor('test_name', {
          id: 'test_name',
          header: 'Test Name',
          enableGrouping: false,
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
        columnHelper.accessor('test_id_code', {
          id: 'test_id_code',
          header: 'Test ID Code',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
        columnHelper.accessor('lab_facility_name', {
          id: 'lab_facility_name',
          header: 'Lab Name',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('overall_passed', {
          id: 'overall_passed',
          header: 'Passed',
          enableGrouping: true,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('thc_total_percent', {
          id: 'thc_total_percent',
          header: 'THC',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: true,
          enableSorting: true,
        }),
        columnHelper.accessor('thc_total_value', {
          id: 'thc_total_value',
          header: 'THC mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbd_percent', {
          id: 'cbd_percent',
          header: 'CBD',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbd_value', {
          id: 'cbd_value',
          header: 'CBD mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('terpene_total_percent', {
          id: 'terpene_total_percent',
          header: 'Terp%',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('terpene_total_value', {
          id: 'terpene_total_value',
          header: 'Terp mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('thc_a_percent', {
          id: 'thc_a_percent',
          header: 'THC A%',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('thc_a_value', {
          id: 'thc_a_value',
          header: 'THC A mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('delta9_thc_percent', {
          id: 'delta9_thc_percent',
          header: 'Delta 9 THC %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('delta9_thc_value', {
          id: 'delta9_thc_value',
          header: 'Delta 9 THC mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('delta8_thc_percent', {
          id: 'delta8_thc_percent',
          header: 'Delta 8 THC %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('delta8_thc_value', {
          id: 'delta8_thc_value',
          header: 'Delta 8 THC mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('thc_v_percent', {
          id: 'thc_v_percent',
          header: 'THC V %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('thc_v_value', {
          id: 'thc_v_value',
          header: 'THC V mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbd_a_percent', {
          id: 'cbd_a_percent',
          header: 'CBD A %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbd_a_value', {
          id: 'cbd_a_value',
          header: 'CBD A mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbn_percent', {
          id: 'cbn_percent',
          header: 'CBN %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbn_value', {
          id: 'cbn_value',
          header: 'CBN mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbg_a_percent', {
          id: 'cbg_a_percent',
          header: 'CBG A %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbg_a_value', {
          id: 'cbg_a_value',
          header: 'CBG A mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbg_percent', {
          id: 'cbg_percent',
          header: 'CBG %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbg_value', {
          id: 'cbg_value',
          header: 'CBG mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbc_percent', {
          id: 'cbc_percent',
          header: 'CBC %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('cbc_value', {
          id: 'cbc_value',
          header: 'CBC mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('total_cannabinoid_percent', {
          id: 'total_cannabinoid_percent',
          header: 'Total Canna %',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
          enableSorting: true,
        }),
        columnHelper.accessor('total_cannabinoid_value', {
          id: 'total_cannabinoid_value',
          header: 'Total Canna mg/g',
          enableGrouping: false,
          enableColumnFilter: true,
          enableGlobalFilter: false,
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
            <span className="sm:hidden">Lab Tests</span>
            <span className="hidden sm:inline">Lab Tests</span>
          </h1>
        </div>
        <div className="flex items-center"></div>
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
  );
}

export function ErrorBoundary({
  error,
}: {
  readonly error: Error;
}): JSX.Element {
  // console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Lab Tests not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
