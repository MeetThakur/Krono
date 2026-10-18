import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>💥</Text>
          <Text variant="titleLarge" style={styles.title}>
            {this.props.fallbackTitle ?? "Something went wrong"}
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <Button
            mode="contained"
            onPress={this.handleRetry}
            style={styles.button}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
});
