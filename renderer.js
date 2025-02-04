let autoSyncInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  const screenInputDiv = document.getElementById("screen-input");
  const syncScreenDiv = document.getElementById("sync-screen");
  const displayScreenDiv = document.getElementById("display-screen");
  const screenIdInput = document.getElementById("screenId");
  const validateScreenBtn = document.getElementById("validateScreen");
  const syncDeviceBtn = document.getElementById("syncDevice");
  const errorMessage = document.getElementById("errorMessage");
  const syncStatus = document.getElementById("syncStatus");
  const contentList = document.getElementById("contentItems");
  const canvasElem = document.getElementById("canvas");
  const autoSyncToggle = document.getElementById("autoSyncToggle");

  // Initialize Fabric.js Canvas
  const fabricCanvas = new fabric.Canvas(canvasElem, {
    width: 900,
    height: 900,
    backgroundColor: "white",
  });

  let screenId;
  let ws; // WebSocket instance
  let autoReconnectEnabled = localStorage.getItem("autoSync") === "true"; // Load auto-sync preference

  // Set initial UI state for the toggle
  autoSyncToggle.checked = autoReconnectEnabled;

  // Handle user toggle event for Auto-Sync
  autoSyncToggle.addEventListener("change", () => {
    autoReconnectEnabled = autoSyncToggle.checked;
    localStorage.setItem("autoSync", autoReconnectEnabled); // Save preference
  });

  // Initialize WebSocket connection
  function initWebSocket() {
    ws = new WebSocket("ws://localhost:5000");

    ws.addEventListener("open", () => {
      console.log("WebSocket connected.");
      syncStatus.textContent = "Server Connected";
      if (screenId) {
        ws.send(JSON.stringify({ screenId }));
      }
    });

    ws.addEventListener("message", (event) => {
      let messageData;
      try {
        messageData = JSON.parse(event.data);
      } catch (e) {
        console.warn("Received non-JSON message:", event.data);
        return;
      }

      console.log("Received WS message:", messageData);

      if (messageData.screenId && messageData.screenId !== screenId) return;

      switch (messageData.type) {
        case "new-content":
          console.log("New content received:", messageData.data);
          addContentItem({ data: messageData.data });
          break;
        case "update-content":
          console.log("Update content:", messageData);
          break;
        case "delete-content":
          console.log("Delete content:", messageData);
          break;
        case "new-screen":
          console.log("New screen registered:", messageData.screenId);
          break;
        default:
          console.warn("Unhandled message type:", messageData.type);
      }
    });

    ws.addEventListener("close", () => {
      console.log("WebSocket disconnected.");
      syncStatus.textContent = "Disconnected";
      syncStatus.style.color = "red";

      if (autoReconnectEnabled) {
        console.log("Reconnecting in 5 seconds...");
        setTimeout(initWebSocket, 5000);
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      syncStatus.textContent = "Error occurred!";
      syncStatus.style.color = "orange";
    });
  }

  // Validate the screen ID
  validateScreenBtn.addEventListener("click", async () => {
    screenId = screenIdInput.value.trim();
    if (!screenId) return;

    const isValid = await window.electronAPI.validateScreen(screenId);
    if (isValid) {
      errorMessage.classList.add("hidden");
      screenInputDiv.classList.add("hidden");
      syncScreenDiv.classList.remove("hidden");
      if (autoReconnectEnabled) {
        initWebSocket();
      }
      // Display the screenId on the display screen
      const screenIdDisplay = document.getElementById("screenIdDisplay");
      screenIdDisplay.textContent = screenId;
    } else {
      errorMessage.classList.remove("hidden");
    }
  });

  // Sync content from the server and display it
  syncDeviceBtn.addEventListener("click", async () => {
    document.querySelector(".screens").classList.add("hidden");
    syncScreenDiv.classList.add("hidden");
    displayScreenDiv.classList.remove("hidden");

    try {
      const contentData = await window.electronAPI.fetchContent(screenId);
      renderContent(contentData);
    } catch (error) {
      console.error("Error syncing content:", error);
    }
  });

  // Render content on Fabric.js Canvas
  function renderContent(contentData) {
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "white";
    fabricCanvas.renderAll();

    contentList.innerHTML = "";
    window.contentItems = [];

    contentData.forEach((item, index) => {
      const parsedItem = parseContentData(item);
      window.contentItems.push(parsedItem);
      addContentListItem(parsedItem, index);
    });

    if (window.contentItems.length > 0) {
      renderSingleContent(window.contentItems[0]);
    }
  }

  // Parse content data
  function parseContentData(item) {
    let data;
    if (item.data.trim().charAt(0) === "{") {
      try {
        data = JSON.parse(item.data);
      } catch (error) {
        console.error("Error parsing content data as JSON:", error);
        data = { type: "text", text: item.data };
      }
    } else {
      data = { type: "text", text: item.data };
    }
    return data;
  }

  // Render a single content item on Fabric.js Canvas
  function renderSingleContent(data) {
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = data.background || "white";
    fabricCanvas.renderAll();

    if (data.objects) {
      fabricCanvas.loadFromJSON(data, () => {
        fabricCanvas.renderAll();
        console.log("Fabric canvas loaded.");
      });
    } else if (data.type === "text") {
      const textObj = new fabric.Text(data.text || "No text provided", {
        left: 50,
        top: 50,
        fontSize: 20,
        fill: "black",
      });
      fabricCanvas.add(textObj);
    }
  }

  // Add content item to list
  function addContentListItem(data, index) {
    const listItem = document.createElement("li");
    listItem.textContent = data.objects
      ? `Content ${index + 1}: Digital Signage Content (v ${data.version || "N/A"})`
      : `Content ${index + 1}: ${data.type}`;
    listItem.style.cursor = "pointer";
    listItem.addEventListener("click", () => {
      renderSingleContent(data);
    });
    contentList.appendChild(listItem);
  }

  // Add content item dynamically when received via WebSocket
  function addContentItem(content) {
    if (!content || !content.data) return;

    console.log("Adding new content item:", content.data);
    contentList.innerHTML += `<li>${content.data.text || "New Content"}</li>`;
    renderContent([content]); // Rerender all content if needed
  }
});
