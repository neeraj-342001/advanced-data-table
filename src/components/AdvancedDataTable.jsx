import React, { useState, useMemo, useEffect } from 'react';
import { useTable, useFilters, useSortBy, usePagination, useGroupBy } from 'react-table';
import { Drawer, IconButton, Checkbox, TextField, Slider, Select, MenuItem, Grid, Card, CardContent, Typography, InputAdornment } from '@mui/material';
import { Search, Group, ViewColumn } from '@mui/icons-material';
import { format } from 'date-fns';
import Fuse from 'fuse.js';
import sampleData from '../data/sample-data.json';
import './AdvancedDataTable.css';

const AdvancedDataTable = () => {
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [dateRange, setDateRange] = useState([new Date('2020-01-01'), new Date()]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'gallery'

  // Fuse.js setup for search
  const fuse = useMemo(() => new Fuse(sampleData, {
    keys: ['name'],
    includeScore: true,
    threshold: 0.3,
  }), []);

  const filteredData = useMemo(() => {
  if (searchTerm === '') {
    return sampleData;
  }
  const results = fuse.search(searchTerm);
  return results.map(result => result.item);
}, [searchTerm, fuse]);


  // Filter by price range
  const data = useMemo(() => {
    return filteredData.filter(item => {
      const price = item.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
  }, [filteredData, priceRange]);

  // Filter by date range
  const dateFilteredData = useMemo(() => {
    return data.filter(item => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= dateRange[0] && createdAt <= dateRange[1];
    });
  }, [data, dateRange]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortBy, sortOrder]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Category', accessor: 'category' },
    { Header: 'Subcategory', accessor: 'subcategory' },
    {
      Header: 'Created At',
      accessor: 'createdAt',
      Cell: ({ value }) => format(new Date(value), 'dd-MMM-yyyy HH:mm')
    },
    {
      Header: 'Updated At',
      accessor: 'updatedAt',
      Cell: ({ value }) => format(new Date(value), 'dd-MMM-yyyy HH:mm')
    },
    { Header: 'Price', accessor: 'price' },
    { Header: 'Sale Price', accessor: 'sale_price' }
  ], []);
  

  const {
  getTableProps,
  getTableBodyProps,
  headerGroups,
  rows,
  prepareRow,
  state: { pageIndex, pageSize },
  canPreviousPage,
  canNextPage,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageOptions,
  page
} = useTable(
  {
    columns,
    data: sortedData,
    initialState: { hiddenColumns },
  },
  useFilters,
  useGroupBy,
  useSortBy,
  usePagination
);

  const handleHideColumn = (columnId) => {
  setHiddenColumns(prev => {
    const isHidden = prev.includes(columnId);
    return isHidden ? prev.filter(id => id !== columnId) : [...prev, columnId];
  });
};


  const toggleFilterPanel = () => setFilterPanelOpen(!filterPanelOpen);
  const toggleGroupPanel = () => setGroupPanelOpen(!groupPanelOpen);
  const toggleColumnPanel = () => setColumnPanelOpen(!columnPanelOpen);
  const toggleViewMode = () => setViewMode(viewMode === 'table' ? 'gallery' : 'table');

  return (
    <div className="table-container">
      <div className="top-controls">
        <div className="filter-controls">
          <IconButton onClick={toggleFilterPanel}><Search /></IconButton>
          <IconButton onClick={toggleGroupPanel}><Group /></IconButton>
          <IconButton onClick={toggleColumnPanel}><ViewColumn /></IconButton>
        </div>
        <div className="sort-controls">
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {columns.map(column => (
              <MenuItem key={column.accessor} value={column.accessor}>
                Sort by {column.Header}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </div>
      </div>

      {/* Filter Panel */}
      <Drawer anchor='right' open={filterPanelOpen} onClose={toggleFilterPanel}>
        <div style={{ width: 250, padding: 16 }}>
          <h2>Filter Panel</h2>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ marginTop: 16 }}>
            <h3>Price Range</h3>
            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              style={{ marginTop: 16 }}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <h3>Date Range</h3>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setDateRange([new Date(e.target.value), dateRange[1]])}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setDateRange([dateRange[0], new Date(e.target.value)])}
            />
          </div>
        </div>
      </Drawer>

      {/* Group Panel */}
      <Drawer anchor='right' open={groupPanelOpen} onClose={toggleGroupPanel}>
        <div style={{ width: 250, padding: 16 }}>
          <h2>Group Panel</h2>
          <Select
            multiple
            value={selectedGroups}
            onChange={(e) => setSelectedGroups(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {['category', 'subcategory'].map(option => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={selectedGroups.indexOf(option) > -1} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </div>
      </Drawer>

      {/* Column Visibility Panel */}
      <Drawer anchor='right' open={columnPanelOpen} onClose={toggleColumnPanel}>
  <div style={{ width: 250, padding: 16 }}>
    <h2>Column Visibility Panel</h2>
    {columns.map(column => (
      <div key={column.accessor}>
        <Checkbox
          checked={!hiddenColumns.includes(column.accessor)}
          onChange={() => handleHideColumn(column.accessor)}
        />
        {column.Header}
      </div>
    ))}
  </div>
</Drawer>
      
        <div>
          <table {...getTableProps()} className="data-table">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>

          </table>

          {/* Pagination Controls */}
          <div>
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
            <button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</button>
            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </span>
            <Select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map(size => (
                <MenuItem key={size} value={size}>
                  Show {size}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
    </div>
  );
};

export default AdvancedDataTable;