const fetch = require('node-fetch');
const {
  parse,
  isFuture,
  addMinutes,
  differenceInSeconds,
} = require('date-fns');
const { zonedTimeToUtc } = require('date-fns-tz');

const TIMEZONE = 'America/Buenos_Aires';

const TIME_MATCH_TOLERANCE_SECONDS = 60;

let cacheSun = undefined;
let cacheExpire = undefined;
const cacheDuration = 60; // minutes

const schedule = require('../config/schedule.json');
const cords = require('../config/cords.json');
const url = `https://api.sunrise-sunset.org/json?lat=${cords.lat}&lng=${cords.lng}&formatted=0`;

/**
 * Call the sunrise-sunset api.
 */
const getSunData = async () => {
  if (cacheSun && cacheExpire && isFuture(cacheExpire)) {
    return cacheSun;
  }
  const response = await fetch(url);
  const { results } = await response.json();

  cacheSun = results;
  cacheExpire = addMinutes(new Date(), cacheDuration);

  return results;
};

/**
 *  Returns if should trigger an action.
 * @param {Date} triggerAt
 * @param {string} context
 */
const shouldTrigger = (triggerAt, context = 'No context') => {
  const now = new Date();
  const difference = Math.abs(differenceInSeconds(now, triggerAt));
  // Log only if +-30 min. (to avoid spam in console)
  if (difference <= 1800) {
    console.log({
      context,
      difference,
      triggering: difference <= TIME_MATCH_TOLERANCE_SECONDS,
    });
  }

  return difference <= TIME_MATCH_TOLERANCE_SECONDS;
};

const shouldTriggerAtSunset = async () => {
  const { sunset } = await getSunData();
  const triggerAt = new Date(sunset);
  return shouldTrigger(triggerAt, 'Sunset');
};

const shouldTriggerAtSunrise = async () => {
  const { sunrise } = await getSunData();
  const triggerAt = new Date(sunrise);
  return shouldTrigger(triggerAt, 'Sunrise');
};

const shouldTriggerAt = async (rawTime) => {
  const rawTrigger = parse(rawTime, 'HH:mm', new Date());
  // Why the fuck zonedTimeToUtc adds a day????
  const triggerAt = zonedTimeToUtc(rawTrigger, TIMEZONE);
  return shouldTrigger(triggerAt, `@${rawTime}`);
};

module.exports = async () => {
  const triggered = [];

  for (const { scene, at } of schedule) {
    switch (at) {
      case '@sunset':
        if (await shouldTriggerAtSunset()) triggered.push(scene);
        break;
      case '@sunrise':
        if (await shouldTriggerAtSunrise()) triggered.push(scene);
        break;
      default:
        if (await shouldTriggerAt(at)) triggered.push(scene);
        break;
    }
  }

  for (const scene of triggered) {
    console.log(`Triggered: ${scene}`);
    fetch('http://192.168.0.19:7000/discord/post-message', {
      method: 'post',
      body: JSON.stringify({
        content: `Scheduler service: triggered ${scene}`,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // console.log('Scheduler ticked.');

  return { triggered };
};
