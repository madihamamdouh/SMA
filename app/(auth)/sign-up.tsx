import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
     ActivityIndicator,
     Pressable,
     StyleSheet,
     Text,
     TextInput,
     View,
} from "react-native";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/(tabs)");
          if (url.startsWith("http")) {
            window.location.href = url;
            return;
          }

          router.replace(url as Href);
        },
      });
      return;
    }

    console.error("Sign-up attempt not complete:", signUp);
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666"
          onChangeText={setCode}
          keyboardType="numeric"
        />
        {errors.fields.code ? (
          <Text style={styles.error}>{errors.fields.code.message}</Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          {fetchStatus === "fetching" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text style={styles.secondaryButtonText}>Send a new code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter your email"
        placeholderTextColor="#666"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />
      {errors.fields.emailAddress ? (
        <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
      ) : null}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        placeholder="Create a password"
        placeholderTextColor="#666"
        onChangeText={setPassword}
      />
      {errors.fields.password ? (
        <Text style={styles.error}>{errors.fields.password.message}</Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || fetchStatus === "fetching") &&
            styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        {fetchStatus === "fetching" ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign up</Text>
        )}
      </Pressable>

      <View style={styles.linkRow}>
        <Text style={styles.helperText}>Already have an account?</Text>
        <Link href="/(auth)/sign-in">
          <Text style={styles.linkText}>Sign in</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: { alignItems: "center", marginTop: 12 },
  secondaryButtonText: { color: "#0a7ea4", fontWeight: "600" },
  error: { color: "#d32f2f", fontSize: 12, marginBottom: 8 },
  linkRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  helperText: { color: "#374151" },
  linkText: { color: "#0a7ea4", fontWeight: "600", marginLeft: 4 },
});
