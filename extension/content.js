let email = null;
let storedEmail = null;
let emailFunc = () => {
  let parentElement = null;
  const gb_sElement = document.querySelector(".gb_s");

  // Check if the element exists
  if (gb_sElement) {
    // Select the first child of the 'gb_s' element
    const firstChild = gb_sElement.children[0];

    // Check if the first child exists and has at least three children
    if (firstChild && firstChild.children.length >= 3) {
      // Select the third child of the first child
      parentElement = firstChild;
      console.log("Third child:", parentElement);
    } else {
      console.error("First child does not have three children");
    }
  } else {
    console.error("Element with class gb_s not found");
  }
  console.log("parentElement : ", parentElement);
  if (parentElement) {
    const emailElement = parentElement.children[2];
    chrome.storage.sync.get(["emailValue"], function (result) {
      storedEmail = result["emailValue"];
      console.log("Stored email : ", storedEmail);
    });
    if (emailElement) {
      console.log(emailElement.textContent);
      // sendResponse(emailElement.textContent)
      // Send a message to store the email
      email = emailElement.textContent;
      chrome.storage.sync.set({ ["emailValue"]: email }, function () {
        console.log("Email value set!");
      });

      chrome.runtime.sendMessage(
        { message: "get_email", data: emailElement.textContent },
        (response) => {
          console.log(response);
        }
      );
    } else if (!emailElement && storedEmail) {
      email = storedEmail;
    } else {
      setTimeout(emailFunc, 3000);
    }
  } else {
    // window.location.reload()
    // window.location.reload();
    setTimeout(emailFunc, 3000);
  }
};

const mailBoxStorage = () => {
  const parentDiv = document.querySelector(".aiD");
  console.log("parentDiv : ", parentDiv);
  if (!parentDiv) {
    console.error("Parent div not found");
    return null;
  }

  const spans = parentDiv.querySelectorAll("span");
  if (spans.length < 2) {
    console.error("Not enough span elements found");
    return null;
  }

  const used = spans[0].textContent.replace(/,/g, "."); // convert to standard decimal
  const total = spans[1].textContent.replace(/,/g, ".");
  const percent =
    (parseFloat(used.replace(/[^0-9\.]/g, "")) * 100) /
    parseFloat(total.replace(/[^0-9\.]/g, ""));

  return { used: used, total: total, percent: Math.floor(percent) };
};

const checkForStorageInfo = () => {
  const storageData = mailBoxStorage();
  if (storageData) {
    // Send mailbox storage data to the background script
    console.log("storageData : ", storageData);
    chrome.runtime.sendMessage(
      { message: "mailbox_storage", data: storageData },
      (response) => {
        console.log(response);
      }
    );
  } else {
    // Retry after a short delay
    console.log("no storageData");
    setTimeout(checkForStorageInfo, 3000);
  }
};

// checkForStorageInfo();

function blurImages() {
  const images = document.querySelectorAll(".aeF .nH img");
  images.forEach((img) => {
    img.classList.add("blur");
  });
}
function unBlurImages() {
  const images = document.querySelectorAll(".aeF .nH img");
  images.forEach((img) => {
    img.classList.remove("blur");
  });
}

// Add event listener for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "blur_images") {
    blurImages();
    sendResponse({ status: "images blurred" });
  } else if (request.message === "un_blur_images") {
    unBlurImages();
    sendResponse({ status: "images un blurred" });
  } else if (request.message === "un_blur_numbers") {
    unBlurNumbers();
    unBlurInnerNumbers();
    unBlurBody()
    sendResponse({ status: "numbers un blurred" });
  } else if (request.message === "blur_numbers") {
    blurNumbers();
    blurInnerNumber();
    blurInnerBody();
    sendResponse({ status: "numbers blurred" });
  } else if (request.message === "load_content") {
    injectStyles();
    emailFunc();
    checkForStorageInfo();
    sendResponse({ status: email });
    chrome.storage.sync.set({ ["contentLoaded"]: true }, function () {
      console.log("Content Loaded");
    });
  }
});

function manlipulateDom(element, manipulateFunction) {
  return function () {
    manipulateFunction(element);
  };
}

function manlipulateDomElements(element, manipulateFunctions) {
  manipulateFunctions.forEach((func) => {
    let manipulate = manlipulateDom(element, func);
    manipulate();
  });
}

// Methods for manipulating individual dom elements
function updateSubjectHeading(parentElement, manipulateFunctions) {
  let headingElement = parentElement.querySelector(".y6 .bog span");
  manlipulateDomElements(headingElement, manipulateFunctions);
}

function updateSubjectPreview(parentElement, manipulateFunctions) {
  let subjectElement = parentElement.querySelector(".y2");
  manlipulateDomElements(subjectElement, manipulateFunctions);
}

function containsAlphabetAndNumber(s) {
  const hasAlphaNum = /(?=.*[A-Za-z])(?=.*\d)/.test(s);
  const forbiddenSubstrings = ['="', "='", '<span class="alpha-num', "/"];

  if (
    hasAlphaNum &&
    !forbiddenSubstrings.some((substring) => s.includes(substring))
  ) {
    return true;
  }
  return false;
}

function addClassToNumbers(htmlContent) {
  const regex_int = /(\s\d+(\.\d+)?\s)/g;
  const regex_end_int = /\s\d*\.?\d$/;
  // Replace all int and float
  replacedContent = htmlContent.replace(
    regex_int,
    ' <span class="number">$&</span> '
  );
  // console.log("Replaced number : " + replacedContent + "\n");
  if (regex_end_int.test(replacedContent)) {
    replacedContent = replacedContent.replace(
      regex_end_int,
      ' <span class="number">$&</span> '
    );
  }
  return replacedContent;
}

function addClassToAlpahNum(htmlContent) {
  // Replace all alpanumeric
  let strArray = htmlContent.split(" ");
  for (let i = 0; i < strArray.length; i++) {
    if (containsAlphabetAndNumber(strArray[i])) {
      strArray[i] = '<span class="alpha-num">' + strArray[i] + "</span>";
    }
  }
  return strArray.join(" ");
}

function blurNumber(element) {
  let numSpan = element.querySelector("span.number");
  if (numSpan) {
    numSpan.classList.add("blur");
  }
}

function unBlurNumber(element) {
  let numSpan = element.querySelector("span.number");
  if (numSpan) {
    numSpan.classList.remove("blur");
  }
}

function blurAlphaNum(element) {
  let alphaNumSpan = element.querySelector("span.alpha-num");
  if (alphaNumSpan) {
    alphaNumSpan.classList.add("blur");
  }
}

function unblurAlphaNum(element) {
  let alphaNumSpan = element.querySelector("span.alpha-num");
  if (alphaNumSpan) {
    alphaNumSpan.classList.remove("blur");
  }
}

// Prepare Everything
function addClassesToEmailList(element) {
  // Add num class
  let replacedContent = "";
  let htmlContent = element.innerHTML;
  replacedContent = addClassToNumbers(htmlContent);
  // console.log("Replaced end number : " + replacedContent + "\n");
  replacedContent = addClassToAlpahNum(replacedContent);
  // console.log("Replaced alpha-num : " + replacedContent + "\n");
  element.innerHTML = replacedContent;
}

const injectStyles = () => {
  let table = document.querySelector("table.F");
  let subjectContainer = table.querySelectorAll("tr td.xY.a4W");
  // let style = document.createElement("style");
  // style.innerHTML = ".blur {filter: blur(4px);}";
  // document.head.appendChild(style);

  for (i = 0; i < subjectContainer.length; i++) {
    updateSubjectHeading(subjectContainer[i], [addClassesToEmailList]);
    updateSubjectPreview(subjectContainer[i], [addClassesToEmailList]);
  }
};

const blurNumbers = () => {
  let table = document.querySelector("table.F");
  let subjectContainer = table.querySelectorAll("tr td.xY.a4W");

  if (table && subjectContainer) {
    for (i = 0; i < subjectContainer.length; i++) {
      updateSubjectHeading(subjectContainer[i], [blurNumber, blurAlphaNum]);
      updateSubjectPreview(subjectContainer[i], [blurNumber, blurAlphaNum]);
    }
  }
};

const unBlurNumbers = () => {
  let table = document.querySelector("table.F");
  let subjectContainer = table.querySelectorAll("tr td.xY.a4W");
  if (table && subjectContainer) {
    for (i = 0; i < subjectContainer.length; i++) {
      updateSubjectHeading(subjectContainer[i], [unBlurNumber, unblurAlphaNum]);
      updateSubjectPreview(subjectContainer[i], [unBlurNumber, unblurAlphaNum]);
    }
  }
};

// List of target nodes to observe
// const targetNodes = document.querySelectorAll(".D, .adk");
const targetNodes = document.querySelectorAll(".nH .nH.ar4 .aeH .D");
// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList" || mutation.type === "attributes") {
      // Handle DOM change here
      console.log("DOM changed:", mutation);
      // Trigger your custom logic or function
      handleElementUpdate();
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Configuration of the observer
const config = { attributes: true, childList: true, subtree: true };

// Start observing each target node for configured mutations
targetNodes.forEach((targetNode) => observer.observe(targetNode, config));

// Function to handle the element update
function handleElementUpdate() {
  chrome.storage.sync.get(["imageSwitch"], function (result) {
    if (result["imageSwitch"]) {
      blurImages();
      console.log("Image  switch active");
      // setTimeout(blurTextInElement,2000);
    } else {
      console.log("Image switch deactive");
      unBlurImages();
      // setTimeout(blurInner, 5000);
    }
  });

  chrome.storage.sync.get(["numberSwitch"], function (result) {
    console.log("Number switch : ", result['numberSwitch'])
    if (result["numberSwitch"]) {
      blurInnerNumber();
      blurInnerBody();
      blurNumbers();
    }else{
      unBlurInnerNumbers();
      unBlurBody();
      unBlurNumbers();
    }
  });
}

function wrapNumbersAndAlphanumerics(node) {
  // Regex patterns
  const regex_int = /\b\d+(\.\d+)?\b/g;
  const regex_alpha_num = /(?=.*[A-Za-z])(?=.*\d).*/;

  // Forbidden substrings to avoid
  const forbiddenSubstrings = ['="', "='", '<span class="blur"', "/"];

  // Function to check if a string contains alphanumeric characters
  function hasAlphaNum(s) {
    return regex_alpha_num.test(s);
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue;

    // Split text into parts to avoid altering HTML structures
    const parts = text.split(/(<[^>]+>)/g);

    const wrappedParts = parts.map((part) => {
      // Skip HTML tags
      if (part.match(/<[^>]+>/)) {
        return part;
      }

      // Wrap numbers and alphanumeric strings
      return part
        .replace(regex_int, '<span class="blur">$&</span>')
        .replace(/\b([A-Za-z]*\d+[A-Za-z]*)\b/g, (match) => {
          // Only wrap if it's not within forbidden substrings
          if (
            !forbiddenSubstrings.some((substring) => match.includes(substring))
          ) {
            return `<span class="blur">${match}</span>`;
          }
          return match;
        });
    });

    const wrappedText = wrappedParts.join("");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = wrappedText;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    node.replaceWith(fragment);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach((child) => wrapNumbersAndAlphanumerics(child));
  }
}

function blurInnerNumber() {
  // Select the h2 element
  const h2Element = document.querySelector("h2.hP");
  if (!h2Element) {
    return;
  }
  // Log the initial content of the h2 element
  console.log("Original h2 content:", h2Element.innerHTML);
  // Process the child nodes of the h2 element
  h2Element.childNodes.forEach((child) => wrapNumbersAndAlphanumerics(child));

  // Log the final content of the h2 element
  console.log("Final h2 content:", h2Element.innerHTML);
}


// Function to remove blur class from the wrapped elements
function removeBlurFromElement(node) {
  if (node.nodeType === Node.TEXT_NODE) {
      return; // Skip text nodes
  } else if (node.nodeType === Node.ELEMENT_NODE) {
      // If the element has the blur class, remove the class
      if (node.classList.contains('blur')) {
          node.classList.remove('blur');
          // If the element is a <span> with no other classes or attributes, unwrap it
          if (node.tagName === 'SPAN' && node.attributes.length === 0) {
              const parent = node.parentNode;
              while (node.firstChild) {
                  parent.insertBefore(node.firstChild, node);
              }
              parent.removeChild(node);
          }
      }
      // Process child nodes recursively
      node.childNodes.forEach(child => removeBlurFromElement(child));
  }
}

const unBlurInnerNumbers = () =>{
  // Select the h2 element
const h2Element = document.querySelector('h2.hP');
  if (!h2Element) {
    return;
  }
// Log the initial content of the h2 element
console.log('Original h2 content with blur:', h2Element.innerHTML);

// Process the child nodes of the h2 element to remove blur
h2Element.childNodes.forEach(child => removeBlurFromElement(child));

// Log the final content of the h2 element
console.log('Final h2 content without blur:', h2Element.innerHTML);


}



function bodyContainsAlphabetAndNumber(s) {
  const hasAlphaNum = /(?=.*[A-Za-z])(?=.*\d)/.test(s);
  // const forbiddenSubstrings = ['="', "='", '<span class="alpha-num', "/"];

  if (hasAlphaNum) {
    return true;
  }
  return false;
}

function bodyBlurTextContent(element) {
  if (!element || !element.textContent) return;

  // Create a temporary div to safely parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = element.innerHTML;

  // Recursively traverse nodes
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let textContent = node.textContent;

      // Replace numbers with span having class 'blur'
      textContent = textContent.replace(/(\d+(\.\d+)?)/g, '<span class="blur">$&</span>');

      // Replace alphanumeric strings with span having class 'blur'
      textContent = textContent.replace(/\b[A-Za-z\d]+\b/g, (match) => {
        return bodyContainsAlphabetAndNumber(match) 
          ? `<span class="blur">${match}</span>` 
          : match;
      });

      node.replaceWith(...parseHTML(textContent));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(traverse);
    }
  }

  function parseHTML(htmlString) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlString;
    return Array.from(tempElement.childNodes);
  }

  traverse(tempDiv);
  element.innerHTML = tempDiv.innerHTML;
}



const blurInnerBody = () => {
  // Select all elements with the class 'gs'
  let gs = document.querySelectorAll('.gs')
  if(!gs){
    return
  }
  gs.forEach(element => {
    bodyBlurTextContent(element);
  });
}


function bodyUnblurTextContent(element) {
  if (!element || !element.innerHTML) return;

  // Create a temporary div to safely parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = element.innerHTML;

  // Recursively traverse nodes
  function traverse(node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('blur')) {
      // Replace the blurred span with its text content
      const parent = node.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(node.textContent), node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(traverse);
    }
  }

  traverse(tempDiv);
  element.innerHTML = tempDiv.innerHTML;
}


const unBlurBody = () => {
  // Select all elements with the class 'gs'
  let gs = document.querySelectorAll('.gs')
  if(!gs){
    return
  }
  document.querySelectorAll('.gs').forEach(element => {
    bodyUnblurTextContent(element);
  });
}

// setTimeout(blurInnerBody, 3000);

// handleElementUpdate();
setTimeout(handleElementUpdate, 3000);
