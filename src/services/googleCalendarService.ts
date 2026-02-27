
// 🗓️ GOOGLE CALENDAR SERVICE
// Handles authentication and synchronization with Google Calendar API.

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // User must replace this
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // User must replace this
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGapiClient = async () => {
  return new Promise<void>((resolve, reject) => {
    if (window.gapi) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    } else {
      reject('GAPI not loaded');
    }
  });
};

export const initGisClient = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      resolve();
    } else {
      reject('GIS not loaded');
    }
  });
};

export const handleAuthClick = () => {
  return new Promise<void>((resolve, reject) => {
    if (!tokenClient) return reject('Token Client not initialized');

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const handleSignoutClick = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
  }
};

// --- SYNC LOGIC ---

export const createLifeOSCalendar = async () => {
  try {
    const response = await window.gapi.client.calendar.calendars.insert({
      resource: {
        summary: 'LifeOS Protocol',
        description: 'Synced tasks and habits from LifeOS.',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    return response.result.id;
  } catch (err) {
    console.error('Error creating calendar', err);
    return null;
  }
};

export const findLifeOSCalendar = async () => {
  try {
    const response = await window.gapi.client.calendar.calendarList.list();
    const calendars = response.result.items;
    const lifeCal = calendars.find((c: any) => c.summary === 'LifeOS Protocol');
    return lifeCal ? lifeCal.id : null;
  } catch (err) {
    console.error('Error listing calendars', err);
    return null;
  }
};

export const syncEventToCalendar = async (calendarId: string, event: any) => {
  try {
    await window.gapi.client.calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });
  } catch (err) {
    console.error('Error syncing event', err);
  }
};

export const clearCalendarEvents = async (calendarId: string) => {
    // This is dangerous, maybe just clear future events?
    // For now, let's just append.
};
