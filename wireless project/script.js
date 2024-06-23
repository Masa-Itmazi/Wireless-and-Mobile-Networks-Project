document.addEventListener('DOMContentLoaded', () => {
    // Function to calculate Sampler, Quantizer, Source Encoder, Channel Encoder, and Interleaver
    function calculateParameters() {
        var bandwidth = parseFloat(document.getElementById('bandwidth').value.trim());
        var numberOfBits = parseInt(document.getElementById('number-of-bits').value.trim());
        var compressionRate = parseFloat(document.getElementById('compression-rate').value.trim());
        var channelEncoderRate = parseFloat(document.getElementById('channel-encoder-rate').value.trim());
        var interleaverBits = parseFloat(document.getElementById('interleaver-bits').value.trim());
        var numberOfLevels = Math.pow(2, numberOfBits);

        var sampler = 2 * bandwidth;
        var quantizer = numberOfLevels;
        var sourceEncoder = compressionRate * (numberOfBits * sampler);
        var channelEncoder =   sourceEncoder/channelEncoderRate ;
        var interleaver = 1 * channelEncoder;

        var resultElement = document.getElementById('sampler-quantizer-result');
        if (resultElement) {
            resultElement.innerHTML = `
                <h3>Calculated Parameters:</h3>
                <p>Sampler: ${sampler.toFixed(2)}Hz</p>
                <p>Quantizer: ${quantizer.toFixed(2)}</p>
                <p>Source Encoder: ${sourceEncoder.toFixed(2)}bps</p>
                <p>Channel Encoder: ${channelEncoder.toFixed(2)}bps</p>
                <p>Interleaver: ${interleaver.toFixed(2)}bps</p>
            `;
        } else {
            console.error('Element with ID "sampler-quantizer-result" not found.');
        }
    }

    // Function to calculate OFDM Parameters
    function calculateOFDMParameters() {
        var bw = parseFloat(document.getElementById('ofdm-bandwidth').value.trim());
        var df = parseFloat(document.getElementById('subcarrier-spacing').value.trim());
        var N = parseInt(document.getElementById('number-of-symbols').value.trim());
        var T_rb = parseFloat(document.getElementById('resource-block-duration').value.trim()) / 1000;
        var B = parseInt(document.getElementById('modulated-bits').value.trim());
        var n = parseInt(document.getElementById('number-of-parallel-blocks').value.trim());

        var bitsPerResourceElement = Math.log2(B);
        var bitsPerOFDMSymbol = (bw / df) * bitsPerResourceElement;
        var bitsPerResourceBlock = bitsPerOFDMSymbol * N;
        var maxTransmissionRate = (n * bitsPerResourceBlock) / T_rb;

        var resultElement = document.getElementById('ofdm-result');
        if (resultElement) {
            resultElement.innerHTML = `
                <h3>OFDM Calculated Parameters:</h3>
                <p>Bits Per Resource Element: ${bitsPerResourceElement.toFixed(2)}</p>
                <p>Bits Per OFDM Symbol: ${bitsPerOFDMSymbol.toFixed(2)}</p>
                <p>Bits Per Resource Block: ${bitsPerResourceBlock.toFixed(2)}</p>
                <p>Max Transmission Rate: ${maxTransmissionRate.toFixed(2)}bps</p>
            `;
        } else {
            console.error('Element with ID "ofdm-result" not found.');
        }
    }

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
    var calculateThroughputButton = document.querySelector('section.card:nth-of-type(4) button[type="button"]');
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
    const calculatePower = () => {
        const bpskQpskMap = {
            "1.0e-0": 0.0,
            "1.0e-1": 0.0,
            "1.0e-2": 4.0,
            "1.0e-3": 7.0,
            "1.0e-4": 8.0,
            "1.0e-5": 9.7,
            "1.0e-6": 10.7,
            "1.0e-7": 11.5,
            "1.0e-8": 12.0
        };

        const eightPskMap = {
            "1.0e-0": 0.0,
            "1.0e-1": 0.0,
            "1.0e-2": 7.0,
            "1.0e-3": 10.0,
            "1.0e-4": 12.0,
            "1.0e-5": 13.0,
            "1.0e-6": 14.0,
            "1.0e-7": 14.5,
            "1.0e-8": 15.0
        };

        const sixteenPskMap = {
            "1.0e-0": 0.0,
            "1.0e-1": 4.0,
            "1.0e-2": 11.0,
            "1.0e-3": 14.5,
            "1.0e-4": 16.0,
            "1.0e-5": 17.0,
            "1.0e-6": 18.0,
            "1.0e-7": 19.0,
            "1.0e-8": 20.0
        };

        const getConvertedValue = (inputId, unitId) => {
            const value = parseFloat(document.getElementById(inputId).value);
            const unit = document.getElementById(unitId).value;
            if (isNaN(value)) {
                alert('Please enter a valid number');
                return null;
            }
            if (unit === 'unitless') {
                return unitlessToDbConverter(value);
            }
            return value;
        };

        const unitlessToDbConverter = value => {
            if (value <= 0) {
                throw new Error('Value must be greater than 0');
            }
            return 10 * Math.log10(value);
        };

        const findClosestEbNo = (ber, map) => {
            let closestKey = null;
            let minDifference = Number.MAX_VALUE;
            for (const key in map) {
                const difference = Math.abs(parseFloat(key) - ber);
                if (difference < minDifference) {
                    minDifference = difference;
                    closestKey = key;
                }
            }
            return map[closestKey];
        };

        const modulationType = document.getElementById('spinnerModulation').value;
        const ber = parseFloat(document.getElementById('editTextBER').value);

        if (isNaN(ber)) {
            alert('Please enter a valid BER value');
            return;
        }

        const M = getConvertedValue('editTextM', 'spinnerM');
        const Temp = getConvertedValue('editTextTemp', 'spinnerTemp');
        const Nf = getConvertedValue('editTextNf', 'spinnerNf');
        const Rate = getConvertedValue('editTextR', 'spinnerR');
        const LP = getConvertedValue('editTextLP', 'spinnerLP');
        const LfMargin = getConvertedValue('editTextLfMargin', 'spinnerLfMargin');
        const Lf = getConvertedValue('editTextLf', 'spinnerLf');
        const Other = getConvertedValue('editTextOther', 'spinnerOther');
        const Gt = getConvertedValue('editTextGt', 'spinnerGt');
        const Gr = getConvertedValue('editTextGr', 'spinnerGr');
        const Ar = getConvertedValue('editTextAr', 'spinnerAr');
        const At = getConvertedValue('editTextAt', 'spinnerAt');


        if ([M, Temp, Nf, Rate, LP, LfMargin, Lf, Other, Gt, Gr, Ar].includes(null)) {
            alert('Please ensure all values are entered');
            return;
        }

        let selectedMap;
        switch (modulationType) {
            case 'bpsk-qpsk':
                selectedMap = bpskQpskMap;
                break;
            case '8psk':
                selectedMap = eightPskMap;
                break;
            case '16psk':
                selectedMap = sixteenPskMap;
                break;
            default:
                alert('Invalid modulation type selected');
                return;
        }

        const EbOverNo = findClosestEbNo(ber, selectedMap);
        const powerR = M - 228.6 + Temp + Nf + Rate + EbOverNo;
        const powerT = powerR + LP + LfMargin + Lf + Other - Gt - Gr - Ar+ At;

        document.getElementById('textViewResult').innerText = `Power Transmitted in dB: ${powerT.toFixed(2)} dB`;
    };

    window.calculatePower = calculatePower;
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
    const callDropProbability = parseFloat(document.getElementById("call-drop-probability").value);
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

    

