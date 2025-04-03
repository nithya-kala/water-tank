const solveWaterLevels = () => {
  const calculateBtn = document.getElementById("calculateBtn");
  const blockHeightsInput = document.getElementById("blockHeights");
  const waterUnitsDisplay = document.getElementById("waterUnits");
  const svgContainer = document.getElementById("svgContainer");
  const errorMessage = document.getElementById("errorMessage");

  // --- Constants for SVG ---
  const PADDING = 20;
  const BLOCK_WIDTH = 60;
  const UNIT_HEIGHT = 20;
  const GRID_COLOR = "#ccc";
  const BLOCK_COLOR = "#f0ad4e"; // Yellowish-orange
  const WATER_COLOR = "#3498db"; // Blue

  // --- Calculation Function (Two Pointers) ---
  function calculateTrappedWater(heights) {
    if (!heights || heights.length < 3) {
      return 0;
    }

    let left = 0;
    let right = heights.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let totalWater = 0;

    while (left < right) {
      if (heights[left] < heights[right]) {
        if (heights[left] >= leftMax) {
          leftMax = heights[left];
        } else {
          totalWater += leftMax - heights[left];
        }
        left++;
      } else {
        if (heights[right] >= rightMax) {
          rightMax = heights[right];
        } else {
          totalWater += rightMax - heights[right];
        }
        right--;
      }
    }
    return totalWater;
  }

  // --- SVG Generation Function ---
  function generateSVG(heights) {
    if (!heights || heights.length === 0) {
      return '<svg width="100" height="50"><text x="10" y="25" fill="grey">No data</text></svg>';
    }

    const numBlocks = heights.length;
    const maxHeight = Math.max(0, ...heights); // Ensure maxHeight is at least 0

    // Calculate SVG dimensions
    const svgWidth = numBlocks * BLOCK_WIDTH + 2 * PADDING;
    const svgHeight = maxHeight * UNIT_HEIGHT + 2 * PADDING;

    // Precompute max heights for water level calculation
    const leftMaxes = new Array(numBlocks).fill(0);
    const rightMaxes = new Array(numBlocks).fill(0);
    let currentLeftMax = 0;
    for (let i = 0; i < numBlocks; i++) {
      leftMaxes[i] = currentLeftMax;
      currentLeftMax = Math.max(currentLeftMax, heights[i]);
    }
    let currentRightMax = 0;
    for (let i = numBlocks - 1; i >= 0; i--) {
      rightMaxes[i] = currentRightMax;
      currentRightMax = Math.max(currentRightMax, heights[i]);
    }

    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // Optional: Add background grid
    // Horizontal lines
    for (let i = 0; i <= maxHeight; i++) {
      const y = svgHeight - PADDING - i * UNIT_HEIGHT;
      svgContent += `<line x1="${PADDING}" y1="${y}" x2="${
        svgWidth - PADDING
      }" y2="${y}" class="grid-line" />`;
    }
    // Vertical lines
    for (let i = 0; i <= numBlocks; i++) {
      const x = PADDING + i * BLOCK_WIDTH;
      svgContent += `<line x1="${x}" y1="${PADDING}" x2="${x}" y2="${
        svgHeight - PADDING
      }" class="grid-line" />`;
    }

    // Draw blocks and water
    for (let i = 0; i < numBlocks; i++) {
      const blockHeight = heights[i];
      const blockPixelHeight = blockHeight * UNIT_HEIGHT;

      // Draw block
      if (blockHeight > 0) {
        const x = PADDING + i * BLOCK_WIDTH;
        const y = svgHeight - PADDING - blockPixelHeight;
        svgContent += `<rect x="${x}" y="${y}" width="${BLOCK_WIDTH}" height="${blockPixelHeight}" class="block" />`;
      }

      // Calculate and draw water
      // The water level is limited by the *original* tallest block to the left/right
      const effectiveLeftMax = Math.max(0, ...heights.slice(0, i)); // Max height strictly to the left
      const effectiveRightMax = Math.max(0, ...heights.slice(i + 1)); // Max height strictly to the right

      // Corrected calculation using precomputed *including* current index for boundary check
      let actualLeftMax = 0;
      for (let k = 0; k <= i; k++)
        actualLeftMax = Math.max(actualLeftMax, heights[k]);
      let actualRightMax = 0;
      for (let k = i; k < numBlocks; k++)
        actualRightMax = Math.max(actualRightMax, heights[k]);

      const waterLevel = Math.min(actualLeftMax, actualRightMax);

      const waterUnitsAboveBlock = Math.max(0, waterLevel - blockHeight);

      if (waterUnitsAboveBlock > 0) {
        const waterPixelHeight = waterUnitsAboveBlock * UNIT_HEIGHT;
        const waterLevelPixels = waterLevel * UNIT_HEIGHT;
        const x = PADDING + i * BLOCK_WIDTH;
        // Water sits on top of the block, up to the waterLevel
        const y = svgHeight - PADDING - waterLevelPixels;
        svgContent += `<rect x="${x}" y="${y}" width="${BLOCK_WIDTH}" height="${waterPixelHeight}" class="water" />`;
      }
    }

    svgContent += `</svg>`;
    return svgContent;
  }

  // --- Correct approach to find water level above each block for drawing ---
  function generateSVGCorrectedWater(heights) {
    if (!heights || heights.length === 0) {
      return '<svg width="100" height="50"><text x="10" y="25" fill="grey">No data</text></svg>';
    }

    const numBlocks = heights.length;
    const maxHeight = Math.max(0, ...heights);

    const svgWidth = numBlocks * BLOCK_WIDTH + 2 * PADDING;
    const svgHeight = maxHeight * UNIT_HEIGHT + 2 * PADDING;

    // Precompute max heights from left and right *including* the current index
    const leftMaxArr = new Array(numBlocks).fill(0);
    leftMaxArr[0] = heights[0];
    for (let i = 1; i < numBlocks; i++) {
      leftMaxArr[i] = Math.max(leftMaxArr[i - 1], heights[i]);
    }

    const rightMaxArr = new Array(numBlocks).fill(0);
    rightMaxArr[numBlocks - 1] = heights[numBlocks - 1];
    for (let i = numBlocks - 2; i >= 0; i--) {
      rightMaxArr[i] = Math.max(rightMaxArr[i + 1], heights[i]);
    }

    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // Optional: Add background grid
    // Horizontal lines
    for (let i = 0; i <= maxHeight; i++) {
      const y = svgHeight - PADDING - i * UNIT_HEIGHT;
      svgContent += `<line x1="${PADDING}" y1="${y}" x2="${
        svgWidth - PADDING
      }" y2="${y}" class="grid-line" />`;
    }
    // Vertical lines
    for (let i = 0; i <= numBlocks; i++) {
      const x = PADDING + i * BLOCK_WIDTH;
      svgContent += `<line x1="${x}" y1="${PADDING}" x2="${x}" y2="${
        svgHeight - PADDING
      }" class="grid-line" />`;
    }

    // Draw blocks and water
    for (let i = 0; i < numBlocks; i++) {
      const blockHeight = heights[i];
      const blockPixelHeight = blockHeight * UNIT_HEIGHT;

      // Draw block
      if (blockHeight > 0) {
        const x = PADDING + i * BLOCK_WIDTH;
        const y = svgHeight - PADDING - blockPixelHeight;
        svgContent += `<rect x="${x}" y="${y}" width="${BLOCK_WIDTH}" height="${blockPixelHeight}" class="block" />`;
      }

      // Calculate water level and height above this block
      const waterLevel = Math.min(leftMaxArr[i], rightMaxArr[i]);
      const waterUnitsAboveBlock = Math.max(0, waterLevel - blockHeight);

      if (waterUnitsAboveBlock > 0) {
        const waterPixelHeight = waterUnitsAboveBlock * UNIT_HEIGHT;
        const waterTopY = svgHeight - PADDING - waterLevel * UNIT_HEIGHT; // Y coordinate of the water surface
        const x = PADDING + i * BLOCK_WIDTH;

        svgContent += `<rect x="${x}" y="${waterTopY}" width="${BLOCK_WIDTH}" height="${waterPixelHeight}" class="water" />`;
      }
    }

    svgContent += `</svg>`;
    return svgContent;
  }

  // --- Event Listener ---
  calculateBtn.addEventListener("click", () => {
    errorMessage.textContent = ""; // Clear previous errors
    svgContainer.innerHTML = ""; // Clear previous SVG
    waterUnitsDisplay.textContent = "Total Water: 0 Units";

    const inputText = blockHeightsInput.value.trim();
    let heights;

    try {
      // Attempt to parse input (allows numbers, arrays like [1,2,3], or just comma-separated 1,2,3)
      if (inputText.startsWith("[") && inputText.endsWith("]")) {
        heights = JSON.parse(inputText);
      } else {
        heights = inputText
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "")
          .map(Number);
      }

      // Validate parsed array
      if (
        !Array.isArray(heights) ||
        heights.some(isNaN) ||
        heights.some((n) => n < 0)
      ) {
        throw new Error(
          "Invalid input: Please enter a valid array or comma-separated list of non-negative numbers."
        );
      }

      // Calculate water
      const totalWater = calculateTrappedWater(heights);

      // Display result
      waterUnitsDisplay.textContent = `Total Water: ${totalWater} Units`;

      // Generate and display SVG
      // Use the corrected SVG function that uses precomputed max arrays
      svgContainer.innerHTML = generateSVGCorrectedWater(heights);
    } catch (error) {
      console.error("Error processing input:", error);
      errorMessage.textContent =
        error.message ||
        "Invalid input format. Use comma-separated numbers or a JSON array like [1,2,3].";
      waterUnitsDisplay.textContent = "Total Water: Error";
    }
  });

  // Initial calculation on page load with default value
  calculateBtn.click();
};

document.addEventListener("DOMContentLoaded", solveWaterLevels());
