const auth = require('../middleware/auth');
const superAdmin = require('../middleware/superAdmin');
const { Restaurant, validateRestaurant } = require('../models/restaurant.js');
const { PacingsSchedule } = require('../models/pacingsschedule.js');
const { Status } = require('../models/status.js');
const { Tag } = require('../models/tag.js');
const { TablesSchedule } = require('../models/tablesschedule.js');
const { Schedule } = require('../models/schedule.js');
const express = require('express');
const router = express.Router();
const addTryCatch = require('../middleware/async');

router.post(
  '/',
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const { error } = validateRestaurant(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const restaurant = new Restaurant({
      name: req.body.name,
      initials: ['CC'],
    });
    await restaurant.save();

    defaultPacingsSchedules.restaurant = restaurant._id;
    const pacingsSchedule = new PacingsSchedule(defaultPacingsSchedules);
    await pacingsSchedule.save();

    defaultStatus.restaurant = restaurant._id;
    const status = new Status(defaultStatus);
    await status.save();

    defaultTables.restaurant = restaurant._id;
    const tablesSchedule = new TablesSchedule(defaultTables);
    await tablesSchedule.save();

    defaultTag.restaurant = restaurant._id;
    const tag = new Tag(defaultTag);
    await tag.save();

    defaultSchedules.restaurant = restaurant._id;
    defaultSchedules.days.forEach((d) => {
      d.pacingsId = pacingsSchedule._id;
      d.statusesId = status._id;
      d.tablesIds[0].tablesId = tablesSchedule._id;
    });
    const schedule = new Schedule(defaultSchedules);
    await schedule.save();

    res.send(restaurant);
  })
);

// also probably need router.get("/me") when there is more info in restaurants

router.get(
  '/',
  [auth, superAdmin],
  addTryCatch(async (req, res) => {
    const restaurants = await Restaurant.find();
    res.send(restaurants);
  })
);

router.get(
  '/public/:slug',
  addTryCatch(async (req, res) => {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) return res.status(404).send('Restaurant not found!');
    res.send(restaurant._id);
  })
);

module.exports = router;

const defaultPacingsSchedules = {
  restaurant: null,
  name: 'Default',
  maxPacing: 25,
  defaultPacing: 15,
  pacings: [
    {
      time: 1200,
      max: 15,
      booked: 0,
    },
    {
      time: 1230,
      max: 15,
      booked: 0,
    },
  ],
  services: [
    {
      name: 'Lunch',
      time: null,
    },
  ],
};

const defaultStatus = {
  restaurant: null,
  name: 'Default',
  useAdvancedTurns: true,
  turnTimeTotal: [
    {
      tableSize: 1,
      time: 90,
    },
    {
      tableSize: 6,
      time: 120,
    },
  ],
  list: [
    {
      phase: 1,
      active: 1,
      name: 'booked',
      icon: '<ImportContactsIcon />',
      timeLeft: [],
    },
    {
      phase: 1,
      active: 1,
      name: 'deposit paid',
      icon: 'Dep',
      timeLeft: [],
    },
    {
      phase: 2,
      active: 1,
      name: 'sat',
      icon: 'Sat',
      timeLeft: [
        {
          tableSize: 1,
          time: 90,
        },
        {
          tableSize: 6,
          time: 120,
        },
      ],
    },
    {
      phase: 2,
      active: 1,
      name: 'starters',
      icon: 'Str',
      timeLeft: [
        {
          tableSize: 1,
          time: 75,
        },
        {
          tableSize: 6,
          time: 100,
        },
      ],
    },
    {
      phase: 2,
      active: 1,
      name: 'mains',
      icon: 'Mns',
      timeLeft: [
        {
          tableSize: 1,
          time: 60,
        },
        {
          tableSize: 6,
          time: 80,
        },
      ],
    },
    {
      phase: 2,
      active: 1,
      name: 'desserts',
      icon: 'Des',
      timeLeft: [
        {
          tableSize: 1,
          time: 45,
        },
        {
          tableSize: 6,
          time: 50,
        },
      ],
    },
    {
      phase: 2,
      active: 1,
      name: 'bill',
      icon: '<ReceiptOutlinedIcon />',
      timeLeft: [
        {
          tableSize: 1,
          time: 30,
        },
        {
          tableSize: 6,
          time: 30,
        },
      ],
    },
    {
      phase: 2,
      active: 1,
      name: 'paid',
      icon: '<AttachMoneyOutlinedIcon />',
      timeLeft: [
        {
          tableSize: 1,
          time: 15,
        },
        {
          tableSize: 6,
          time: 15,
        },
      ],
    },
    {
      phase: 3,
      active: 1,
      name: 'left',
      icon: '<Check />',
      timeLeft: [],
    },
    {
      phase: 3,
      active: 1,
      name: 'cancelled',
      icon: '<ClearRoundedIcon />',
      timeLeft: [],
    },
    {
      phase: 3,
      active: 1,
      name: 'no show',
      icon: '?',
      timeLeft: [],
    },
  ],
};

const defaultTables = {
  restaurant: null,
  name: 'Default',
  tables: [
    {
      name: 'T1',
      covers: 2,
      online: true,
    },
    {
      name: 'T2',
      covers: 2,
      online: true,
    },
  ],
};

const defaultTag = { restaurant: null, text: 'Allergy', color: 'rgb(255 0 0)' };

const defaultSchedules = {
  restaurant: null,
  name: 'Default',
  startDate: '1969-12-31T23:00:00.000Z',
  lastDate: '1969-12-31T23:00:00.000Z',
  length: 1,
  days: [
    {
      day: 1,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
    {
      day: 2,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
    {
      day: 3,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
    {
      day: 4,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
    {
      day: 5,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
    {
      day: 6,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
    {
      day: 0,
      tablesIds: [
        {
          time: 0,
          tablesId: null,
        },
      ],
      pacingsId: null,
      statusesId: null,
    },
  ],
};
