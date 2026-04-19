import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { RideAPI } from '../services/api'; 
import { TOITOI_THEME } from '../theme';

interface Props { isVisible: boolean; rideId: string | number; onClose: () => void; }

const ISSUE_TAGS = ["Rude Driver", "Overcharged", "Car Not Clean", "Late Arrival", "Reckless Driving"];
const COMPLIMENT_TAGS = ["Polite Driver", "Clean Toto", "Safe Driving", "On Time", "Great Music"];

export default function RatingDisputeSheet({ isVisible, rideId, onClose }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Error', 'Please select a rating.'); return; }
    setIsSubmitting(true);
    try {
      await RideAPI.rateRide(rideId, { rating, review_text: reviewText, tags: selectedTags });
      if (rating <= 3 && selectedTags.length > 0) {
        await RideAPI.disputeRide(rideId, { issue_type: selectedTags.join(','), description: reviewText });
      }
      setIsSubmitting(false);
      onClose(); 
    } catch (error) { setIsSubmitting(false); Alert.alert('Error', 'Failed to submit feedback.'); }
  };

  const currentTags = rating > 0 && rating <= 3 ? ISSUE_TAGS : COMPLIMENT_TAGS;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>HOW WAS YOUR RIDE?</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => { setRating(star); setSelectedTags([]); }}>
                <Text style={[styles.starText, { color: rating >= star ? TOITOI_THEME.colors.primary : TOITOI_THEME.colors.gray.light }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <View style={[styles.disputeContainer, rating > 3 && { backgroundColor: TOITOI_THEME.colors.primaryLight }]}>
              <Text style={styles.subtitle}>{rating <= 3 ? "WHAT WENT WRONG?" : "WHAT WAS GREAT?"}</Text>
              <View style={styles.tagWrapper}>
                {currentTags.map((tag) => (
                  <TouchableOpacity 
                    key={tag} 
                    style={[styles.tagBtn, selectedTags.includes(tag) && styles.tagBtnActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {rating > 0 && (
            <TextInput
              style={styles.textInput} placeholder="Leave a comment (Optional)..."
              placeholderTextColor={TOITOI_THEME.colors.gray.text} multiline numberOfLines={3}
              value={reviewText} onChangeText={setReviewText}
            />
          )}

          {rating > 0 && (
            <TouchableOpacity 
              style={[styles.submitBtn, rating <= 3 && { backgroundColor: TOITOI_THEME.colors.danger }]} 
              onPress={handleSubmit} disabled={isSubmitting}
            >
              <Text style={[styles.submitBtnText, rating <= 3 && { color: TOITOI_THEME.colors.white }]}>
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FEEDBACK'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  bottomSheet: { backgroundColor: TOITOI_THEME.colors.white, padding: 24, borderTopWidth: 4, borderColor: TOITOI_THEME.colors.black, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, textAlign: 'center', marginBottom: 20 },
  starContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  starText: { fontSize: 55, textShadowColor: '#000', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 },
  disputeContainer: { marginBottom: 20, padding: 16, backgroundColor: TOITOI_THEME.colors.gray.light, borderWidth: 3, borderColor: TOITOI_THEME.colors.black },
  subtitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 10 },
  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  tagBtnActive: { backgroundColor: TOITOI_THEME.colors.black },
  tagText: { fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  tagTextActive: { color: TOITOI_THEME.colors.white },
  textInput: { borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 16, fontSize: 16, backgroundColor: TOITOI_THEME.colors.white, marginBottom: 20, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: TOITOI_THEME.colors.primary, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 18, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  submitBtnText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
});