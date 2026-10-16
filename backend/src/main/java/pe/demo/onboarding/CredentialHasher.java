package pe.demo.onboarding;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class CredentialHasher {
    private static final int SALT_LENGTH = 16;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final byte[] key;

    @Inject
    public CredentialHasher(@ConfigProperty(name = "onboarding.hmac.key") String secret) {
        key = secret.getBytes(StandardCharsets.UTF_8);
        if (key.length < 32) {
            throw new IllegalStateException("ONBOARDING_HMAC_KEY must contain at least 32 bytes.");
        }
    }

    public String newTrackingToken() {
        byte[] token = new byte[32];
        RANDOM.nextBytes(token);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token);
    }

    public String trackingTokenHash(String token) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hmac(token.getBytes(StandardCharsets.UTF_8)));
    }

    public byte[] newSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        RANDOM.nextBytes(salt);
        return salt;
    }

    public byte[] credentialHash(byte[] salt, String credential) {
        byte[] value = credential.getBytes(StandardCharsets.UTF_8);
        byte[] saltedValue = ByteBuffer.allocate(salt.length + value.length)
                .put(salt)
                .put(value)
                .array();
        return hmac(saltedValue);
    }

    public boolean matches(byte[] expectedHash, byte[] salt, String candidate) {
        return MessageDigest.isEqual(expectedHash, credentialHash(salt, candidate));
    }

    public boolean matchesTrackingToken(String expectedHash, String candidate) {
        return MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.US_ASCII),
                trackingTokenHash(candidate).getBytes(StandardCharsets.US_ASCII));
    }

    private byte[] hmac(byte[] value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(value);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("HMAC-SHA-256 is unavailable.", exception);
        }
    }
}
