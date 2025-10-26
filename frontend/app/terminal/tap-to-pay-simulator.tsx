import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Modal, Pressable, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import useBLE from "@/hooks/useBLE";
import { BASE_URL } from "@/api";
import axios from "axios";

interface NotificationData {
    payee_id: string;
    amount: string;
    secureToken: string;
    concept: string;
    receiver: string;
}

export default function TapToPaySimulator() {
    const { bleManager, scanForPeripherals, requestPermissions, allDevices, connectAndSubscribe, disconnect, stopScan } = useBLE();
    const [modalVisible, setModalVisible] = useState(false);
    const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
    const [startScan, setStartScan] = useState(false);

    useEffect(() => {
        let stateSub = bleManager.onStateChange((state) => {
            if (state === "PoweredOn") {
                requestPermissions();
                setStartScan(true);
            }
        }, true);

        return () => {
            stateSub.remove();
            stopScan();
            disconnect();
        };
    }, [bleManager, scanForPeripherals]);

    useEffect(() => {
        if (startScan)
            scanForPeripherals();
    }, [startScan]);

    useEffect(() => {
        (async () => {
            if (allDevices.length === 0) {
                console.log("No receivers found nearby");
                return;
            }

            stopScan();
            setStartScan(false);

            const best = [...allDevices].sort(
                (a, b) => (b.rssi ?? -999) - (a.rssi ?? -999)
            )[0];

            console.log("Connecting to", best.name ?? best.localName, best.rssi);

            await connectAndSubscribe(best.id, (msg) => {
                try {
                    const data = JSON.parse(msg);
                    console.log("Received message:", data);
                    setNotificationData({
                        payee_id: data.payeeId || "Unknown",
                        amount: data.amount || "0.00",
                        secureToken: data.secureToken || "Unknown",
                        concept: data.concept || "No concept provided",
                        receiver: "Alex Fitzmaurice"
                    });
                    setModalVisible(true);
                } catch (error) {
                    console.error("Failed to parse notification:", error);
                }
            });
        })().catch(console.error);
    }, [allDevices]);

    const completeTransfer = async () => {
        if (!notificationData) return;

        try {
            const { data } = await axios.post(`${BASE_URL}/api/payments/transfer`, notificationData);
            console.log("Transfer completed:", data);
        } catch (error) {
            console.error("Failed to complete transfer:", error);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ThemedView style={styles.container}>
                <View style={styles.content}>
                    {/* Card */}
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            {/* Chip */}
                            <View style={styles.chipContainer}>
                                <View style={styles.chip}>
                                    <View style={styles.chipLines}>
                                        <View style={styles.chipLine} />
                                        <View style={styles.chipLine} />
                                        <View style={styles.chipLine} />
                                    </View>
                                </View>
                            </View>

                            {/* Contactless Icon */}
                            <View style={styles.contactlessIcon}>
                                <View style={styles.contactlessWave} />
                                <View style={[styles.contactlessWave, { marginLeft: 6 }]} />
                                <View style={[styles.contactlessWave, { marginLeft: 12 }]} />
                            </View>

                            {/* Card Number */}
                            <View style={styles.cardNumberContainer}>
                                <ThemedText style={styles.cardNumber}>
                                    •••• •••• •••• 4242
                                </ThemedText>
                            </View>

                            {/* Card Info */}
                            <View style={styles.cardInfo}>
                                <View>
                                    <ThemedText style={styles.cardLabel}>CARDHOLDER</ThemedText>
                                    <ThemedText style={styles.cardValue}>JOHN DOE</ThemedText>
                                </View>
                                <View>
                                    <ThemedText style={styles.cardLabel}>EXPIRES</ThemedText>
                                    <ThemedText style={styles.cardValue}>12/25</ThemedText>
                                </View>
                            </View>

                            {/* Card Brand */}
                            <View style={styles.cardBrand}>
                                <ThemedText style={styles.brandText}>VISA</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Hint Text */}
                    <ThemedText style={styles.hintText}>
                        Hold card near reader to pay
                    </ThemedText>
                </View>

                {/* Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Payment Confirmation</ThemedText>
                            
                            <View style={styles.modalDetails}>
                                <View style={styles.modalRow}>
                                    <ThemedText style={styles.modalLabel}>Receiver</ThemedText>
                                    <ThemedText style={styles.modalValue}>{notificationData?.receiver}</ThemedText>
                                </View>
                                
                                <View style={styles.modalRow}>
                                    <ThemedText style={styles.modalLabel}>Amount</ThemedText>
                                    <ThemedText style={styles.modalValueAmount}>${notificationData?.amount}</ThemedText>
                                </View>
                                
                                <View style={styles.modalRow}>
                                    <ThemedText style={styles.modalLabel}>Concept</ThemedText>
                                    <ThemedText style={styles.modalValue}>{notificationData?.concept}</ThemedText>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={completeTransfer}
                            >
                                <ThemedText style={styles.modalButtonText}>Complete Transfer</ThemedText>
                            </TouchableOpacity>
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <ThemedText style={styles.modalButtonText}>Close</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 24,
    },
    cardContainer: {
        width: "100%",
        maxWidth: 380,
        alignSelf: "center",
    },
    card: {
        aspectRatio: 1.586,
        borderRadius: 20,
        backgroundColor: "#667eea",
        padding: 24,
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    chipContainer: {
        alignSelf: "flex-start",
    },
    chip: {
        width: 50,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#FFD700",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DAA520",
    },
    chipLines: {
        flexDirection: "row",
        gap: 4,
    },
    chipLine: {
        width: 2,
        height: 20,
        backgroundColor: "#DAA520",
        borderRadius: 1,
    },
    contactlessIcon: {
        position: "absolute",
        top: 24,
        right: 24,
        flexDirection: "row",
        transform: [{ rotate: "90deg" }],
    },
    contactlessWave: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
    },
    cardNumberContainer: {
        marginTop: 20,
    },
    cardNumber: {
        fontSize: 22,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: 2,
        fontFamily: "monospace",
    },
    cardInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    cardLabel: {
        fontSize: 10,
        color: "rgba(255, 255, 255, 0.6)",
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: 1,
    },
    cardBrand: {
        alignSelf: "flex-end",
        marginTop: 8,
    },
    brandText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        fontStyle: "italic",
        letterSpacing: 2,
    },
    hintText: {
        fontSize: 15,
        opacity: 0.5,
        textAlign: "center",
        marginTop: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalContent: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 24,
        textAlign: "center",
    },
    modalDetails: {
        gap: 20,
        marginBottom: 32,
    },
    modalRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 12,
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    modalValue: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1F2937",
    },
    modalValueAmount: {
        fontSize: 20,
        fontWeight: "700",
        color: "#667eea",
    },
    modalButton: {
        backgroundColor: "#667eea",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginVertical: 8
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
});
