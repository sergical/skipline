# Image Performance Best Practices

## Overview
Images are often the largest assets in mobile apps and can significantly impact performance. This guide covers best practices for optimizing images in the Skipline app.

## Current Implementation
- Using placeholder images from Lorem Picsum (400x300)
- Images loaded via React Native's Image component
- Product images served from backend `image_url` field

## Performance Considerations

### 1. Image Formats
- **WebP**: 25-35% smaller than JPEG with same quality
- **AVIF**: Up to 50% smaller but limited support
- **Progressive JPEG**: Better perceived performance

### 2. Image Sizing Strategy
```javascript
// Responsive image sizes based on device
const imageWidths = {
  thumbnail: 150,  // List view
  card: 400,       // Product cards
  detail: 800,     // Product detail
  hero: 1200       // Full screen
};

// Device pixel ratio consideration
const dpr = PixelRatio.get();
const actualWidth = imageWidth * dpr;
```

### 3. Lazy Loading
- Load images only when they're about to enter viewport
- Use FlatList's built-in virtualization
- Implement progressive loading (blur → low res → full res)

### 4. Caching Strategy
```javascript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: product.image_url,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 5. CDN Integration
```javascript
// Image optimization service
function getOptimizedImageUrl(url: string, width: number) {
  // Cloudinary example
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  
  // Or Imgix
  return `${url}?w=${width}&auto=format,compress`;
}
```

### 6. Performance Monitoring
```javascript
// Track image load times with Sentry
Sentry.startSpan({ name: 'image.load', op: 'ui.load' }, async (span) => {
  span.setAttributes({
    'image.url': imageUrl,
    'image.width': width,
    'image.format': 'webp'
  });
  
  // Image loading logic
});
```

## Implementation Roadmap

### Phase 1: Basic Optimization
1. Add image dimensions to prevent layout shift
2. Implement blur placeholders
3. Use appropriate image sizes

### Phase 2: Advanced Features
1. Integrate CDN with automatic resizing
2. Add offline caching with react-native-fast-image
3. Implement progressive image loading

### Phase 3: Monitoring
1. Track image load performance in Sentry
2. Monitor bandwidth usage
3. A/B test image quality vs performance

## Example Implementation

```typescript
// components/OptimizedImage.tsx
import { useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function OptimizedImage({ 
  source, 
  width, 
  height,
  placeholder 
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Get optimized URL based on screen size
  const optimizedUrl = getOptimizedImageUrl(source, width);
  
  return (
    <View style={{ width, height }}>
      {loading && (
        <Image
          source={{ uri: placeholder }}
          style={StyleSheet.absoluteFill}
          blurRadius={20}
        />
      )}
      
      <Animated.Image
        entering={FadeIn}
        source={{ uri: optimizedUrl }}
        style={{ width, height }}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
      />
      
      {loading && (
        <ActivityIndicator style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
}
```

## Metrics to Track
- Time to First Byte (TTFB)
- Image decode time
- Total bytes downloaded
- Cache hit rate
- User-perceived load time

## Tools
- [Squoosh](https://squoosh.app/) - Image optimization
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image) - Performance-focused image component
- Sentry Performance Monitoring - Track real-world metrics
