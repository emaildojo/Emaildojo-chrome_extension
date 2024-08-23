let count = 1;
let isLoggedIn = false;
let emailCount = 0;
let emailSpace = 0;
let total = 0;
let occupied = 0;
let used = 0;
let email = "";
let userName = "";
let image = "";

document.addEventListener("DOMContentLoaded", function () {
  let auth = document.getElementById("login-btn");
  let loader = document.getElementById("loadingdiv");
  let selectSwitch = document.getElementById("cont");
  let cleaupSwitch = document.getElementById("cleaupSwitch");
  let deleteBox = document.getElementById("delete-box");
  let makeSpace = document.getElementById("make-space");
  let delPopup = document.getElementById("del-popup");
  let cleanupForm = document.getElementById("cleanup-form");
  let cancel = document.getElementById("cancel");
  let makeSpaceBack = document.getElementById("make-space-back");
  let del = document.getElementById("delete");
  let profile = document.getElementById("profile");
  let privacySwitch = document.getElementById("privacySwitch");
  let imageSwitch = document.getElementById("imageSwitch");
  let numberSwitch = document.getElementById("numberSwitch");
  let cleanupSection = document.getElementById("cleanup-section");
  let privacySection = document.getElementById("privacy-section");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { message: "load_content" },
      (response) => {
        let res = false;
        chrome.storage.sync.get(["contentLoaded"], function (result) {
          console.log("res ...... : ", result["contentLoaded"]);
          res = result["contentLoaded"];
          // });
          // console.log("RESPONSE : ", response)
          // if (res)
          // {
          chrome.storage.sync.get(["privacySwitch"], function (result) {
            console.log("privacySwitch", result["privacySwitch"]);
            if(result["privacySwitch"]){
              privacySwitch.checked = true
              privacySection.classList.remove("display-none")
            }else{
              imageSwitch.checked = false;
              numberSwitch.checked = false;
              privacySwitch.checked = false;
              chrome.storage.sync.set({ ["imageSwitch"]: false }, function () {
                console.log("Image value set!");
              });
              chrome.storage.sync.set({ ["numberSwitch"]: false }, function () {
                console.log("Number value set!");
              });
            }
          });

          chrome.storage.sync.get(["imageSwitch"], function (result) {
            console.log("imageSwitch", result["imageSwitch"]);
            if (result["imageSwitch"]) {
              imageSwitch.checked = true;
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "blur_images" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            } else {
              imageSwitch.checked = false;
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "un_blur_images" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            }
          });

          chrome.storage.sync.get(["numberSwitch"], function (result) {
            console.log("numberSwitch", result["numberSwitch"]);
            if (result["numberSwitch"]) {
              numberSwitch.checked = true;
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "blur_numbers" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            } else {
              numberSwitch.checked = false;
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "un_blur_numbers" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            }
          });
          // Function to check user logged in status
          chrome.runtime.sendMessage(
            { message: "check_user_logged_in" },
            function (response) {
              if (response.error) {
                // User is not logged in, handle this case (redirect to login page or show login prompt)
                console.log("User is not logged in : ".response);
                return;
              }

              if (response.status) {
                auth.classList.remove("display-none");
                loader.classList.add("display-none");
              } else {
                profile.classList.remove("display-none");
                image = response.profile_image;
                userName = response.user_name;
                // email = response.email
                let profileImage = document.getElementById("profile-image");
                profileImage.src = image;

                let user = document.getElementById("userName");
                user.innerText = userName;

                let userEmail = document.getElementById("em");
                userEmail.innerText = response.email;

                isLoggedIn = true;
                loader.classList.add("display-none");
                selectSwitch.classList.remove("display-none");
                cleaupSwitch.checked = true;
                if (cleaupSwitch.checked) {
                  innerContainer.classList.remove("display-none");
                  bodyOperations();
                }
              }
              console.log("RESPONSE : ", response);
            }
          );
          // User is logged in, proceed with fetching data

          // Fetch and display unread email count
          // let cleaupSwitch = document.getElementById("cleaupSwitch")
          let innerContainer = document.getElementById("inner");
          if (cleaupSwitch.checked) {
            innerContainer.classList.remove("display-none");
            bodyOperations();
          }

          cleaupSwitch.addEventListener("change", (event) => {
            if (cleaupSwitch.checked) {
              innerContainer.classList.remove("display-none");
              return;
            } else {
              // privacySwitch.checked = false;
              innerContainer.classList.add("display-none");
              bodyOperations();
            }
          });
          // delete section
          deleteBox.addEventListener("click", function () {
            makeSpace.classList.remove("display-none");
            innerContainer.classList.add("display-none");
            backUpFiles();
          });

          // delet form
          delPopup.addEventListener("click", function () {
            cleanupForm.classList.remove("display-none");
            makeSpace.classList.add("display-none");
          });

          cancel.addEventListener("click", function () {
            cleanupForm.classList.add("display-none");
            makeSpace.classList.remove("display-none");
          });

          makeSpaceBack.addEventListener("click", function () {
            makeSpace.classList.add("display-none");
            innerContainer.classList.remove("display-none");
          });

          del.addEventListener("click", function () {
            deleteAndBackUp();
          });

          // privacy functions
          privacySwitch.addEventListener("change", () => {
            if (privacySwitch.checked) {
              chrome.storage.sync.set({ ["privacySwitch"]: true }, function () {
                console.log("privacy value set!");
              });
              // cleanupSection.classList.add("display-none");
              privacySection.classList.remove("display-none");
              // cleaupSwitch.checked = false;
            } else {
              chrome.storage.sync.set({ ["privacySwitch"]: false }, function () {
                console.log("privacy value set!");
              });
              chrome.storage.sync.set({ ["imageSwitch"]: false }, function () {
                console.log("Image value set!");
              });
              chrome.storage.sync.set({ ["numberSwitch"]: false }, function () {
                console.log("Number value set!");
              });

              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "un_blur_images" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );

              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "un_blur_numbers" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
              // cleanupSection.classList.remove("display-none");
              privacySection.classList.add("display-none");
              imageSwitch.checked = false;
              numberSwitch.checked = false;
              // cleaupSwitch.checked = true;
            }
          });
          imageSwitch.addEventListener("change", () => {
            if (imageSwitch.checked) {
              chrome.storage.sync.set({ ["imageSwitch"]: true }, function () {
                console.log("Image value set!");
              });
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "blur_images" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            } else {
              chrome.storage.sync.set(
                { ["imageSwitch"]: false },
                function () {
                  console.log("Image value set!");
                }
              );
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "un_blur_images" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            }
          });

          numberSwitch.addEventListener("change", () => {
            if (numberSwitch.checked) {
              chrome.storage.sync.set({ ["numberSwitch"]: true }, function () {
                console.log("number value set!");
              });
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "blur_numbers" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            } else {
              chrome.storage.sync.set({ ["numberSwitch"]: false }, function () {
                console.log("Image value set!");
              });
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    { message: "un_blur_numbers" },
                    (response) => {
                      console.log(response);
                    }
                  );
                }
              );
            }
          });
          // }
        });
      }
    );
  });
});

const bodyOperations = () => {
  chrome.runtime.sendMessage(
    { message: "get_unread_count" },
    function (response) {
      if (isLoggedIn) {
        if (response.error) {
          document.getElementById("unreadCount").innerText =
            "Error fetching unread count";
          document.getElementById("form-unseen-count").innerText =
            "Error fetching unread count";
          document.getElementById("clean-unseen-count").innerText =
            "Error fetching unread count";
        } else {
          emailCount = response.total_unread_count;
          document.getElementById("unreadCount").innerText = emailCount;
          document.getElementById("form-unseen-count").innerText = emailCount;
          document.getElementById("clean-unseen-count").innerText = emailCount;
        }
      }
    }
  );

  // Fetch and display mailbox storage data
  chrome.runtime.sendMessage(
    { message: "get_mailbox_storage" },
    function (response) {
      if (isLoggedIn) {
        if (response) {
          occupied = response.percent;
          total = response.total;
          used = response.used;
          document.getElementById("occupied").innerHTML = `${
            occupied ? occupied : "0"
          }% <br> <span style="color:black;font-size:14px;">Occupied</span> `;
          document.getElementById("mailbox-storage-progress").innerHTML = `
                        <div class="progress" style="height: 20px;width:100%; border-radius:10px">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${
                              occupied ? occupied : "0"
                            }%;border-radius:10px;" aria-valuenow="${
            occupied ? occupied : "0"
          }" aria-valuemin="0" aria-valuemax="100">${
            occupied ? occupied : "0"
          }%</div>
                        </div>
                        <p style="font-size:11px"> ${used ? used : "0"} of ${
            total ? total : "0"
          } </p>`;
          // document.getElementById('form-unseen-space').innerText = used
        } else {
          document.getElementById("mailbox-storage-progress").innerText =
            "Error fetching mailbox storage data";
          // document.getElementById('form-unseen-space').innerText = 'Error fetching mailbox storage data';
        }
      }
    }
  );

  // Fetch and display unread email size
  chrome.runtime.sendMessage(
    { message: "get_unread_space" },
    function (response) {
      if (isLoggedIn) {
        if (response.error) {
          document.getElementById("unread-space").innerText =
            "Error fetching unread email size";
          document.getElementById("form-unseen-space").innerText =
            "Error fetching mailbox storage data";
        } else {
          if(response.status){
            console.log("RESPONSE STORAGE : ", response.total_mailbox_size);
            emailSpace = (response.total_mailbox_size / 1073741824).toFixed(3);
            // emailSpace = 1.3234
            console.log("email space : ", emailSpace);
            document.getElementById("unread-space").innerHTML = `
                          <div class="progress" style="height: 20px;width:100%; border-radius:10px">
                              <div class="progress-bar bg-success" role="progressbar" style="width: ${
                                calculatePercentage(emailSpace, used)
                                  ? calculatePercentage(emailSpace, used)
                                  : "0"
                              }%;border-radius:10px;" aria-valuenow="${
              calculatePercentage(emailSpace, used)
                ? calculatePercentage(emailSpace, used)
                : "0"
            }" aria-valuemin="0" aria-valuemax="100">${
              calculatePercentage(emailSpace, used)
                ? calculatePercentage(emailSpace, used)
                : "0"
            }%</div>
                          </div>
                          <p style="font-size:11px"> ${
                            emailSpace ? emailSpace : "0"
                          } GB of ${used ? used : "0"} </p>`;
            document.getElementById("form-unseen-space").innerText = emailSpace;
          }else{
            document.getElementById("unread-space").innerHTML = response.message
          }
        }
      }
    }
  );

  // Fetch and display email subjects and sizes
  chrome.runtime.sendMessage(
    { message: "get_subjectline_and_size" },
    function (response) {
      if (isLoggedIn) {
        if (response.error) {
          document.getElementById("subjectLine").innerText =
            "Error fetching email subjects and sizes";
        } else {
          const emailTable = `
                        <table>
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Size (MB)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${response.emails
                                  .map(
                                    (email) => `
                                    <tr>
                                        <td>${email.subject}</td>
                                        <td>${(
                                          email.size /
                                          (1024 * 1024)
                                        ).toFixed(2)}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>`;
          document.getElementById("subjectLine").innerHTML = emailTable;
        }
      }
    }
  );

  // Event listener for next page button
  document.getElementById("next-page").addEventListener("click", function () {
    if (isLoggedIn) {
      // Display loading state
      document.getElementById("subjectLine").innerHTML = `<table>
            <thead>
                <tr>
                    <th class="shimmer">Subject</th>
                    <th class="shimmer">Size (MB)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="shimmer" colspan="2">&nbsp;</td>
                </tr>
            </tbody>
        </table>`;

      // Fetch next page data
      chrome.runtime.sendMessage(
        { message: "get_next_page" },
        function (response) {
          if (response.error) {
            document.getElementById("apiResponse").innerText =
              "Error: " + response.error;
          } else {
            const emailTable = `
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Size (MB)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.emails
                              .map(
                                (email) => `
                                <tr>
                                    <td>${email.subject}</td>
                                    <td>${(email.size / (1024 * 1024)).toFixed(
                                      2
                                    )}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>`;
            document.getElementById("subjectLine").innerHTML = emailTable;
          }
        }
      );
    }
  });
};

const backUpFiles = () => {
  chrome.runtime.sendMessage(
    { message: "list_backup_files" },
    function (response) {
      if (isLoggedIn) {
        if (response.error) {
          document.getElementById("back-table").innerText =
            "Error fetching email subjects and sizes";
        } else {
          const BackTable = `
                    <table>
                        <thead>
                            <tr>
                                <th class="shimmer">File</th>
                                    <th class="shimmer">Deletion date</th>
                                    <th class="shimmer">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${response
                          .map(
                            (i) => `
                            <tr>
                                <td>${i.file_name}</td>
                                <td>${i.backup_date}</td>
                                <td class="d-flex justify-content-center"><a href="http://167.172.20.169${i.file_path}" target="_blank"><img src="/images/download.svg" alt="" width="30" height="30"></a>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                        </tbody>
                    </table>`;
          document.getElementById("back-table").innerHTML = BackTable;
        }
      }
    }
  );
};

const deleteAndBackUp = () => {
  let makeSpace = document.getElementById("make-space");
  let filename = document.getElementById("filename");
  let password = document.getElementById("password");
  let repeatPassword = document.getElementById("repeat-password");
  let loader = document.getElementById("loadingdiv");
  let cleanupForm = document.getElementById("cleanup-form");
  let selectSwitch = document.getElementById("cont");
  cleanupForm.classList.add("display-none");
  makeSpace.classList.remove("display-none");
  selectSwitch.classList.add("display-none");
  // loader.classList.remove("display-none")

  if (!password.value || !filename.value) {
    alert("Please fill all the fields !");
    makeSpace.classList.remove("display-none");
    loader.classList.add("display-none");
    selectSwitch.classList.remove("display-none");
    return;
  } else if (repeatPassword.value != password.value) {
    alert("Repeat secret key does not match !");
    makeSpace.classList.remove("display-none");
    loader.classList.add("display-none");
    selectSwitch.classList.remove("display-none");
    return;
  }

  makeSpace.classList.remove("display-none");
  loader.classList.add("display-none");
  selectSwitch.classList.remove("display-none");
  alert("Please visit after 30 minutes for backup file !");
  chrome.runtime.sendMessage(
    {
      message: "delete_email",
      data: {
        zip_password: password.value,
        zip_filename: filename.value,
      },
    },
    function (response) {
      console.log("Delete response:", response);
      makeSpace.classList.remove("display-none");
      loader.classList.add("display-none");
      selectSwitch.classList.remove("display-none");
      backUpFiles();
      alert("response : ", response);
    }
  );
};

function calculatePercentage(part, total) {
  console.log("part : ", part);
  console.log("total : ", Number(total.split(" ")[0]));
  if (Number(total.split(" ")[0]) === 0) {
    return 0; // Avoid division by zero
  }
  console.log("(part / total) : ", part / Number(total.split(" ")[0]));
  return ((part / Number(total.split(" ")[0])) * 100).toFixed(2); // Convert to percentage and round to 2 decimal places
}
