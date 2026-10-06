const WORKFLOW_STORAGE_KEY = 'campussphere-workflow-ui-preview';
const APPLICATION_STORAGE_KEY = 'campussphere-event-applications-ui-preview';

export function readWorkflowPreview() {
  try {
    const value = window.sessionStorage.getItem(WORKFLOW_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Unable to read CampusSphere workflow preview data:', error);
    return null;
  }
}

export function readPublishedPreviewEvents() {
  const workflow = readWorkflowPreview();
  return Array.isArray(workflow?.publishedEvents) ? workflow.publishedEvents : [];
}

export function readPreviewApplications() {
  try {
    const value = window.sessionStorage.getItem(APPLICATION_STORAGE_KEY);
    const applications = value ? JSON.parse(value) : [];
    return Array.isArray(applications) ? applications : [];
  } catch (error) {
    console.error('Unable to read CampusSphere application preview data:', error);
    return [];
  }
}

export function savePreviewApplication(application) {
  const applications = readPreviewApplications();
  const exists = applications.some((item) => item.eventId === application.eventId && item.regNo === application.regNo);
  if (exists) return false;
  try {
    window.sessionStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify([application, ...applications]));
    return true;
  } catch (error) {
    console.error('Unable to save CampusSphere application preview data:', error);
    throw new Error('This application could not be saved in the browser preview.');
  }
}

export function hasPreviewApplication(eventId, regNo) {
  return readPreviewApplications().some((item) => item.eventId === eventId && item.regNo === regNo);
}
