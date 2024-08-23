let mailboxStorageData = {};
let email = "";
let nextPageToken = "";
let count = 1;

function initialize(response) {
  console.log("email res : ", response);
  if (response) {
    email = response;
    if(email)
    console.log("EMAIL : ", email);
  }
  console.log("EMAIL OUTSIDE : ", email);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { message: "load_content" }, (response) => {
      console.log(response.status);
    });
  });
  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { message: "blur_images" }, (response) => {
      console.log(response.status);
    });
  });
  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(
      tab.id,
      { message: "un_blur_images" },
      (response) => {
        console.log(response.status);
      }
    );
  });

  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { message: "blur_numbers" }, (response) => {
      console.log(response.status);
    });
  });

  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(
      tab.id,
      { message: "un_blur_numbers" },
      (response) => {
        console.log(response.status);
      }
    );
  });
});

// Listener for messages from content script or other parts of the extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case "get_email":
      initialize(request.data);
      break;
    // case "store_email":
    //     storeEmail(request.data);
    //     break;
    case "check_user_loggedin":
      handleCheckUserLoggedIn(sendResponse);
      break;
    case "mailbox_storage":
      mailboxStorageData = request.data;
      sendResponse({ status: "ok" });
      break;
    case "get_unread_count":
      handleGetUnreadCount(sendResponse);
      break;
    case "get_mailbox_storage":
      handleGetMailboxStorage(sendResponse);
      break;
    case "get_subjectline_and_size":
      handleGetSubjectLineAndSize(sendResponse);
      break;
    case "get_unread_space":
      handleGetUnreadSpace(sendResponse);
      break;
    case "get_next_page":
      handleGetNextPage(sendResponse);
      break;
    case "check_user_logged_in":
      handleUserLoggedIn(sendResponse);
      break;
    case "list_backup_files":
      handleListBackUp(sendResponse);
      break;
    case "delete_email":
      handleDeleteEmail(request.data, sendResponse);
      break;
    default:
      console.error("Unknown message:", request.message);
      sendResponse({ error: "Unknown message" });
      break;
  }
  return true; // Required to use sendResponse asynchronously
});

function handleCheckUserLoggedIn(sendResponse) {
  fetch(`http://127.0.0.1:5000/email_wipe/token_info?email=${email}`)
    .then((response) => response.json())
    .then((data) => sendResponse(data))
    .catch((error) => {
      console.error("Error fetching user status", error);
      sendResponse({ error: "Error fetching user status" });
    });
}

function handleGetUnreadCount(sendResponse) {
  fetch(`http://127.0.0.1:5000/email_wipe/total-unread-emails?email=${email}`)
    .then((response) => response.json())
    .then((data) => sendResponse(data))
    .catch((error) => {
      console.error("Error fetching unread count:", error);
      sendResponse({ error: "Error fetching unread count" });
    });
}

function handleGetMailboxStorage(sendResponse) {
  sendResponse(mailboxStorageData);
}

function handleGetSubjectLineAndSize(sendResponse) {
  fetch(`http://127.0.0.1:5000/email_wipe/list-emails?email=${email}`)
    .then((response) => response.json())
    .then((data) => {
      sendResponse(data);
      nextPageToken = data.nextPageToken;
      console.log("Data from background js:", data);
      console.log("Next Page : ", nextPageToken);
    })
    .catch((error) => {
      console.error("Error fetching email subjects and sizes:", error);
      sendResponse({ error: "Error fetching email subjects and sizes" });
    });
}

function handleGetUnreadSpace(sendResponse) {
  fetch(`http://127.0.0.1:5000/email_wipe/mailbox-size?email=${email}`)
    .then((response) => response.json())
    .then((data) => sendResponse(data))
    .catch((error) => {
      console.error("Error fetching unread email size:", error);
      sendResponse({ error: "Error fetching unread email size" });
    });
}

function handleGetNextPage(sendResponse) {
  fetch(
    `http://127.0.0.1:5000/email_wipe/list-emails?email=${email}&pageToken=${nextPageToken}`
  )
    .then((response) => response.json())
    .then((data) => {
      sendResponse(data);
      nextPageToken = data.nextPageToken;
    })
    .catch((error) => {
      console.error("Error making API call:", error);
      sendResponse({ error: "Error making API call" });
    });
}

function handleUserLoggedIn(sendResponse) {
  fetch(`http://127.0.0.1:5000/email_wipe/token_info?email=${email}`)
    .then((response) => response.json())
    .then((data) => {
      sendResponse(data);
      nextPageToken = data.nextPageToken;
    })
    .catch((error) => {
      console.error("Error making API call:", error);
      sendResponse({ error: "Error making API call" });
    });
}

function handleListBackUp(sendResponse) {
  fetch(`http://127.0.0.1:5000/email_wipe/list-backup-files?email=${email}`)
    .then((response) => response.json())
    .then((data) => {
      sendResponse(data);
    })
    .catch((error) => {
      console.error("Error making API call:", error);
      sendResponse({ error: "Error making API call" });
    });
}

function handleDeleteEmail(data, sendResponse) {
  fetch("http://127.0.0.1:5000/email_wipe/backup-and-delete-unread-emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      zip_password: data.zip_password,
      zip_filename: data.zip_filename,
    }),
  })
    .then((response) => response.json())
    .then((data) => sendResponse(data))
    .catch((error) => {
      console.error("Error deleting emails:", error);
      sendResponse({ error: "Error deleting emails" });
    });
}
