// Function to calculate Throughput
function calculateThroughput() {
    var selection = document.getElementById('csma-selection').value;
    var g_kfps = parseFloat(document.getElementById('g').value.trim()); // in kfps
    var bw_mbps = parseInt(document.getElementById('data-transmission-bandwidth').value.trim()); // in Mbps
    var frameSize_kbit = parseFloat(document.getElementById('frame-size').value.trim()); // in kbit
    var T_microsec = parseFloat(document.getElementById('T').value.trim()); // in microsec

    // Convert units
    var g_fps = g_kfps * 1000; // kiloframes per second to frames per second
    var bw_bps = bw_mbps * 1e6; // megabits per second to bits per second
    var frameSize_bits = frameSize_kbit * 1000; // kilobits to bits
    var T_sec = T_microsec / 1e6; // microseconds to seconds

    // Calculate Tb, Tframe, G, alpha
    var Tb = 1 / bw_bps; // inverse of bandwidth in bps
    var Tframe = frameSize_bits * Tb; // frame size in bits * Tb
    var G = g_fps * Tframe; // g in frames * Tframe
    var alpha = T_sec / Tframe; // T in seconds / Tframe

    // Print the values for debugging
    console.log('g_kfps:', g_kfps);
    console.log('bw_mbps:', bw_mbps);
    console.log('frameSize_kbit:', frameSize_kbit);
    console.log('T_microsec:', T_microsec);
    console.log('T_sec:', T_sec);
    console.log('Tb:', Tb);
    console.log('Tframe:', Tframe);
    console.log('G:', G);
    console.log('alpha:', alpha);

    var S_th;

    switch (selection) {
        case 'unslotted-nonpersistent':
            S_th = G * Math.exp(-2 * alpha * T_sec) / (G * (1 + 2 * alpha) + Math.exp(-alpha * G));
            break;
        case 'slotted-nonpersistent':
            S_th = alpha * G * Math.exp(-2 * alpha * T_sec) / (1 - Math.exp(-alpha * G) + alpha);
            break;
        case 'unslotted-1-persistent':
            S_th = (G * Math.exp(-G * (alpha * 2 + 1)) * (1 + G + alpha * G * (1 + G + 0.5 * alpha * G))) / ((G * (1 + 2 * alpha)) - (1 - Math.exp(-alpha * G)) + ((1 + alpha * G) * Math.exp(-G * (1 + alpha))));
            break;
        case 'slotted-1-persistent':
            S_th = (G * (1 + alpha - Math.exp(-alpha * G)) * Math.exp(-G * (1 + alpha))) / ((1 + alpha) * (1 - Math.exp(-alpha * G) + (alpha * Math.exp(-G * (1 + alpha)))));
            break;
        default:
            console.error('Invalid CSMA selection.');
            S_th = 0;
            break;
    }

    // Display results
    var throughputResultElement = document.getElementById('throughput-result');
    if (throughputResultElement) {
        // Adjust display logic for small non-zero values
        if (Math.abs(S_th) < 0.01) {
            throughputResultElement.innerHTML = `<p>Throughput: < 0.01 bps</p>`;
        } else {
            throughputResultElement.innerHTML = `<p>Throughput: ${S_th.toFixed(4)} bps</p>`;
        }
    } else {
        console.error('Element with ID "throughput-result" not found.');
    }
}

// Attach event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Attach calculateParameters function to the Calculate button click event
    var calculateButton = document.querySelector('#calculator-form button[type="button"]');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateParameters);
    } else {
        console.error('Calculate button not found.');
    }

    // Attach calculateOFDMParameters function to the Calculate button click event
    var calculateOFDMButton = document.querySelector('section.card:nth-of-type(2) button[type="button"]');
    if (calculateOFDMButton) {
        calculateOFDMButton.addEventListener('click', calculateOFDMParameters);
    } else {
        console.error('OFDM Calculate button not found.');
    }

    // Attach calculateThroughput function to the Calculate button click event
    var calculateThroughputButton = document.querySelector('section.card:nth-of-type(3) button[type="button"]');
    if (calculateThroughputButton) {
        calculateThroughputButton.addEventListener('click', calculateThroughput);
    } else {
        console.error('Throughput Calculate button not found.');
    }

    // Attach toggleMATParameters function to the selection change event
    var matSelection = document.getElementById('mat-selection');
    if (matSelection) {
        matSelection.addEventListener('change', toggleMATParameters);
    } else {
        console.error('MAT selection dropdown not found.');
    }
});

function calculateCellularSystem() {
    // Retrieve input values
    const timeslotsPerCarrier = parseFloat(document.getElementById("timeslots-per-carrier").value);
    const cityArea = parseFloat(document.getElementById("city-area").value);
    const users = parseFloat(document.getElementById("number-of-users").value);
    const callsPerDay = parseFloat(document.getElementById("calls-per-day").value);
    const callDuration = parseFloat(document.getElementById("call-duration").value);
    const callDropProbability = parseFloat(document.getElementById("call-drop-probability").value) / 100;
    const sir = parseFloat(document.getElementById("sir").value);
    const referenceDistance = parseFloat(document.getElementById("reference-distance").value);
    const powerAtReference = parseFloat(document.getElementById("power-reference-distance").value);
    const pathLossExponent = parseFloat(document.getElementById("path-loss-exponent").value);
    const receiverSensitivity = parseFloat(document.getElementById("receiver-sensitivity").value);

    // Calculate intermediate values
    const powerAtReferenceWatt = Math.pow(10, powerAtReference/10);
    const maxDistance = referenceDistance / (Math.pow(((receiverSensitivity * Math.pow(10,-6))/ powerAtReferenceWatt ),1/pathLossExponent));
    const maxCellSize = (3/2) * Math.sqrt(3) * Math.pow(maxDistance,2); 
    const numberOfCells = Math.ceil(cityArea / maxCellSize);

    const trafficLoadPerUser = (callsPerDay / (24 * 60)) * callDuration;
    const trafficLoadWholeSys = trafficLoadPerUser * users;
    const trafficLoadEachCell = trafficLoadWholeSys / numberOfCells;
    const sirNoUnit = Math.pow(10, sir/10);
    const clusterSize = Math.pow((6*sirNoUnit),(2/pathLossExponent)) / 3;
    
    let N = [1, 3, 4, 7, 9, 12, 13, 16, 19, 21, 28];

    // Find the closest larger value in N array
    let closestValue = N[0];
    for (let i = 0; i < N.length; i++) {
        if (clusterSize <= N[i]) {
            closestValue = N[i];
            break;
        }
    }

    const numOfChannels = calculateN(trafficLoadEachCell, callDropProbability);

    // Display results
    document.getElementById("cellular-system-result").innerHTML = `
        <p>Maximum distance between transmitter and receiver for reliable communication: ${maxDistance.toFixed(2)} meters</p>
        <p>Maximum cell size assuming hexagonal cells: ${maxCellSize.toFixed(2)} km²</p>
        <p>The number of cells in the service area: ${numberOfCells}</p>
        <p>Traffic load in the whole cellular system: ${trafficLoadWholeSys.toFixed(2)} Erlangs</p>
        <p>Traffic load in each cell: ${trafficLoadEachCell.toFixed(2)} Erlangs</p>
        <p>Number of cells in each cluster: ${closestValue}</p>
        <p>Number of channels: ${numOfChannels}</p>
    `;
}

function factorial(n) {
    return n ? n * factorial(n - 1) : 1;
}

function erlangB(N, A) {
    let numerator = Math.pow(A, N) / factorial(N);
    let denominator = 0;
    for (let i = 0; i <= N; i++) {
        denominator += Math.pow(A, i) / factorial(i);
    }
    return numerator / denominator;
}

function calculateN(trafficLoadEachCell, callDropProbability) {
    let N = 0;
    const A = trafficLoadEachCell;
    const B = callDropProbability;

    if (isNaN(B) || isNaN(A) || B <= 0 || B >= 1 || A <= 0) {
        console.error("Invalid input values for probability (0 < probability < 1) and Traffic > 0");
        return "Invalid input values";
    }

    while (true) {
        let calculatedB = erlangB(N, A);
        if (calculatedB <= B) {
            return N;
        }
        N++;
        if (N > 1000) {
            console.error("Calculation did not converge. Try with different values of B and A.");
            return "Calculation did not converge";
        }
    }
}
