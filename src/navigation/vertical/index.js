export default [
  {
    title: 'Reports',    
    icon: { icon: 'tabler-chart-bar' },
    children: [
      {
        title: 'Dashboard',
        to: { name: "reports-dashboard" },
      },
      {
        title: 'Countries',
        to: 'reports-countries',
      },
      {
        title: 'Providers',
        to: 'reports-providers',
      },
      {
        title: 'Customers',
        to: 'reports-customers',
      },
      {
        title: 'MccMnc',
        to: 'reports-mccmnc',
      },
      {
        title: 'Senders',
        to: 'reports-senders',
      },
    ],
  },
  {
    title: 'Last Messages',
    icon: { icon: 'tabler-message-code' },
    to: 'last-messages',     
  },
  {
    title: 'Issues',
    icon: { icon: 'tabler-bug-filled' },
    to: { name: 'incident-mobile' },
  },
  {
    title: 'Connections',
    icon: { icon: 'tabler-server' },
    children: [
      {
        title: 'Customer',
        to: "connections-customer",
      },
      {
        title: 'Provider',
        to: "connections-provider",
      },
    ]    
    
  },
  {
    title: 'Routing',
    icon: { icon: 'tabler-road' },
    children: [
      {
        title: 'General',
        to: "routes-general",
      },
      {
        title: 'Sender',
        to: "routes-senders",
      },
      {
        title: 'BlackList',
        to: "routes-blacklist",
      },
      {
        title: 'Backup',
        to: "routes-backup",
      },
    ]  
    
  },
  {
    title: 'Pricing',
    to: 'pricing',     
    icon: { icon: 'tabler-currency-euro' },    
  },
  {
    title: 'Billing',
    to: { name: 'billing' },
    icon: { icon: 'tabler-folder-open' },    
  },
  {
    title: 'Clearing',
    to: { name: 'clearing' },
    icon: { icon: 'tabler-deselect' },    
  },
  {
    title: 'Quality Routes',
    to: { name: 'quality' },
    icon: { icon: 'tabler-world' },    
  },
  {
    title: 'Configuration',
    to: { name: 'configuration' },
    icon: { icon: 'tabler-settings-cog' },    
  },
]
