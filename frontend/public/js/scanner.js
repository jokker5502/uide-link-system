// QR Code Scanner using html5-qrcode library
// Handles camera access and QR code scanning

class QRScanner {
    constructor() {
        this.html5QrCode = null;
        this.scanning = false;
        this.onScanCallback = null;
    }

    /**
     * Initialize QR scanner
     * @param {string} elementId - Video element ID
     * @param {function} onScan - Callback when QR code scanned
     */
    async init(elementId, onScan) {
        this.onScanCallback = onScan;

        // Initialize html5-qrcode
        this.html5QrCode = new Html5Qrcode(elementId);

        console.log('[Scanner] Initialized');
    }

    /**
     * Start scanning
     */
    async startScanning() {
        if (this.scanning) {
            console.log('[Scanner] Already scanning');
            return;
        }

        try {
            // Get cameras
            const devices = await Html5Qrcode.getCameras();

            if (devices && devices.length) {
                // Prefer rear camera
                const rearCamera = devices.find(d =>
                    d.label.toLowerCase().includes('back') ||
                    d.label.toLowerCase().includes('rear') ||
                    d.label.toLowerCase().includes('environment')
                );

                const cameraId = rearCamera ? rearCamera.id : devices[0].id;
                console.log('[Scanner] Using camera:', rearCamera?.label || devices[0].label);

                // Start scanning
                await this.html5QrCode.start(
                    cameraId,
                    {
                        fps: 10, // Frames per second
                        qrbox: { width: 250, height: 250 }, // Scanning box size
                        aspectRatio: 1.0
                    },
                    (decodedText, decodedResult) => {
                        this.handleScan(decodedText, decodedResult);
                    },
                    (errorMessage) => {
                        // Ignore scan errors (no QR in frame)
                    }
                );

                this.scanning = true;
                console.log('[Scanner] Scanning started');
            } else {
                throw new Error('No cameras found');
            }

        } catch (error) {
            console.error('[Scanner] Error starting scan:', error);
            throw error;
        }
    }

    /**
     * Stop scanning
     */
    async stopScanning() {
        if (!this.scanning) {
            return;
        }

        try {
            await this.html5QrCode.stop();
            this.scanning = false;
            console.log('[Scanner] Scanning stopped');
        } catch (error) {
            console.error('[Scanner] Error stopping scan:', error);
        }
    }

    /**
     * Handle QR code scan
     * @param {string} decodedText - QR code data
     * @param {object} decodedResult - Scan result object
     */
    handleScan(decodedText, decodedResult) {
        console.log('[Scanner] QR code scanned:', decodedText);

        // Stop scanning temporarily to prevent duplicates
        this.stopScanning();

        // Parse QR code
        const qrData = this.parseQRCode(decodedText);

        if (qrData) {
            // Call callback
            if (this.onScanCallback) {
                this.onScanCallback(qrData);
            }
        } else {
            console.error('[Scanner] Invalid QR code format');
            alert('Código QR inválido. Por favor escanea un código QR de bus UIDE.');

            // Restart scanning
            setTimeout(() => this.startScanning(), 2000);
        }
    }

    /**
     * Parse UIDE bus QR code (V2 - Static QR Format)
     * Format: UIDE-BUS-XX (static QR per bus)
     * @param {string} qrText - QR code text
     * @returns {object|null} Parsed data or null if invalid
     */
    parseQRCode(qrText) {
        try {
            // Expected format: UIDE-BUS-01, UIDE-BUS-05, etc.
            if (!qrText.startsWith('UIDE-')) {
                console.error('[Scanner] Invalid QR prefix');
                return null;
            }

            // Trigger instant feedback
            this.triggerInstantFeedback();

            return {
                staticQrId: qrText,
                scanTime: new Date().toISOString(),
                rawData: qrText
            };

        } catch (error) {
            console.error('[Scanner] QR parse error:', error);
            return null;
        }
    }

    /**
     * Trigger instant haptic/audio feedback
     */
    triggerInstantFeedback() {
        // Vibration pattern: short-long-short
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Audio feedback (optional - can add sound file)
        try {
            const audio = new Audio('/sounds/scan-success.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => { }); // Ignore if sound fails
        } catch (e) {
            // Audio not critical
        }
    }

    /**
     * Check camera permissions
     * @returns {Promise<boolean>} Has permission
     */
    async checkPermissions() {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            return result.state === 'granted';
        } catch (error) {
            // Permissions API not supported, try requesting access
            return true;
        }
    }

    /**
     * Request camera permissions
     * @returns {Promise<boolean>} Permission granted
     */
    async requestPermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            // Stop stream immediately
            stream.getTracks().forEach(track => track.stop());

            return true;
        } catch (error) {
            console.error('[Scanner] Permission denied:', error);
            return false;
        }
    }
}

// Export
window.QRScanner = QRScanner;
