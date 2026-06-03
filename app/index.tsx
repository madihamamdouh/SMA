import { useAuth, useUser, useClerk, useUserProfileModal } from '@clerk/expo'
import { AuthView, UserButton } from '@clerk/expo/native'
import { Text, View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native'

export default function MainScreen() {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { user } = useUser()
  const { signOut } = useClerk()
  const { presentUserProfile } = useUserProfileModal()

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!isSignedIn) {
    return <AuthView mode="signInOrUp" />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden' }}>
          <UserButton />
        </View>
      </View>
      <View style={styles.profileCard}>
        {user?.imageUrl && <Image source={{ uri: user.imageUrl }} style={styles.avatar} />}
        <View>
          <Text>Hello {user?.id}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.linkButton} onPress={presentUserProfile}>
        <Text style={styles.linkButtonText}>Manage Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.linkButton, { backgroundColor: '#666' }]}
        onPress={() => signOut()}
      >
        <Text style={styles.linkButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12
  },
  linkButton: {
    padding: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    marginBottom: 8
  },
  linkButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  }
})