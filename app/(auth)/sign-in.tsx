import { useSignIn } from "@clerk/expo";
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

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/(tabs)");
          if (url.startsWith("http")) {
            window.location.href = url;
            return;
          }

          router.replace(url as Href);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      // MFA can be handled here if your Clerk instance requires it.
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
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

    console.error("Sign-in attempt not complete:", signIn);
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your account</Text>
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
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text style={styles.secondaryButtonText}>Send a new code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
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
      {errors.fields.identifier ? (
        <Text style={styles.error}>{errors.fields.identifier.message}</Text>
      ) : null}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        placeholder="Enter your password"
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
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>

      <View style={styles.linkRow}>
        <Text style={styles.helperText}>Don’t have an account?</Text>
        <Link href="/(auth)/sign-up">
          <Text style={styles.linkText}>Create one</Text>
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
