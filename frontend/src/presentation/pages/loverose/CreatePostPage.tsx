import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Card,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ArrowBack,
  PhotoCamera,
  Videocam,
  LocationOn,
  Person,
  Public,
  Lock,
  Group,
  Close,
  Add,
  Remove,
  Tune,
  Crop,
  FilterVintage,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// LoveRose-style styled components
const CreateContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#fafafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

const Header = styled(Box)({
  position: 'sticky',
  top: 0,
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #dbdbdb',
  padding: '0 16px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 1000,
});

const HeaderButton = styled(Button)({
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none',
  padding: '0 16px',
  height: '32px',
  borderRadius: '6px',
});

const ContentArea = styled(Box)({
  maxWidth: '935px',
  margin: '0 auto',
  padding: '20px',
});

const StepContainer = styled(Box)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #dbdbdb',
  overflow: 'hidden',
});

const StepHeader = styled(Box)({
  padding: '16px 20px',
  borderBottom: '1px solid #efefef',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StepTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: '600',
  color: '#262626',
});

const MediaUploadArea = styled(Box)({
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed #dbdbdb',
  borderRadius: '8px',
  margin: '20px',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: '#0095f6',
  },
});

const MediaPreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '400px',
  borderRadius: '8px',
});

const VideoPreview = styled('video')({
  maxWidth: '100%',
  maxHeight: '400px',
  borderRadius: '8px',
});

const EditingPanel = styled(Box)({
  padding: '20px',
  borderTop: '1px solid #efefef',
});

const FilterGrid = styled(Grid)({
  marginTop: '16px',
});

const FilterItem = styled(Box)({
  textAlign: 'center',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '8px',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  '&.selected': {
    backgroundColor: '#0095f6',
    color: '#ffffff',
  },
});

const FilterPreview = styled('img')({
  width: '60px',
  height: '60px',
  borderRadius: '6px',
  marginBottom: '4px',
});

const CaptionArea = styled(Box)({
  padding: '20px',
  display: 'flex',
  gap: '16px',
});

const CaptionInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
  },
});

const LocationInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
  },
});

const PrivacySelector = styled(FormControl)({
  minWidth: '200px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
  },
});

const AdvancedSettings = styled(Box)({
  padding: '20px',
  borderTop: '1px solid #efefef',
});

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Edit, 3: Caption
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [hideFromFeed, setHideFromFeed] = useState(false);
  const [turnOffComments, setTurnOffComments] = useState(false);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { name: 'normal', label: 'Normal' },
    { name: 'clarendon', label: 'Clarendon' },
    { name: 'gingham', label: 'Gingham' },
    { name: 'moon', label: 'Moon' },
    { name: 'lark', label: 'Lark' },
    { name: 'reyes', label: 'Reyes' },
    { name: 'juno', label: 'Juno' },
    { name: 'slumber', label: 'Slumber' },
    { name: 'crema', label: 'Crema' },
    { name: 'ludwig', label: 'Ludwig' },
    { name: 'aden', label: 'Aden' },
    { name: 'perpetua', label: 'Perpetua' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    setStep(2); // Move to edit step
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/loverose');
    }
  };

  const handleShare = async () => {
    if (!selectedFiles.length) return;

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
      
      formData.append('content', caption);
      formData.append('location', location);
      formData.append('privacy', privacy);
      formData.append('filter', selectedFilter);
      formData.append('brightness', brightness.toString());
      formData.append('contrast', contrast.toString());
      formData.append('saturation', saturation.toString());
      formData.append('hide_from_feed', hideFromFeed.toString());
      formData.append('turn_off_comments', turnOffComments.toString());
      formData.append('hide_like_count', hideLikeCount.toString());

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate('/loverose');
      } else {
        console.error('Error creating post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Create new post';
      case 2: return 'Edit';
      case 3: return 'Share';
      default: return 'Create new post';
    }
  };

  const renderUploadStep = () => (
    <StepContainer>
      <StepHeader>
        <StepTitle>{getStepTitle()}</StepTitle>
      </StepHeader>
      
      <MediaUploadArea onClick={() => document.getElementById('file-input')?.click()}>
        <PhotoCamera sx={{ fontSize: 96, color: '#262626', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: '#262626' }}>
          Drag photos and videos here
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#0095f6',
            '&:hover': { backgroundColor: '#1877f2' },
            textTransform: 'none',
            fontWeight: '600',
          }}
        >
          Select from computer
        </Button>
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </MediaUploadArea>
    </StepContainer>
  );

  const renderEditStep = () => (
    <StepContainer>
      <StepHeader>
        <StepTitle>{getStepTitle()}</StepTitle>
      </StepHeader>
      
      <Box sx={{ display: 'flex' }}>
        {/* Media Preview */}
        <Box sx={{ flex: 1, p: 2 }}>
          {previewUrls.length > 0 && (
            selectedFiles[0].type.startsWith('video/') ? (
              <VideoPreview src={previewUrls[0]} controls />
            ) : (
              <MediaPreview 
                src={previewUrls[0]} 
                alt="Preview"
                style={{
                  filter: `
                    brightness(${100 + brightness}%)
                    contrast(${100 + contrast}%)
                    saturate(${100 + saturation}%)
                  `
                }}
              />
            )
          )}
        </Box>

        {/* Editing Panel */}
        <Box sx={{ width: '340px', borderLeft: '1px solid #efefef' }}>
          <EditingPanel>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600' }}>
              Filters
            </Typography>
            
            <FilterGrid container spacing={1}>
              {filters.map((filter) => (
                <Grid item xs={3} key={filter.name}>
                  <FilterItem
                    className={selectedFilter === filter.name ? 'selected' : ''}
                    onClick={() => setSelectedFilter(filter.name)}
                  >
                    <FilterPreview src={previewUrls[0]} />
                    <Typography variant="caption">{filter.label}</Typography>
                  </FilterItem>
                </Grid>
              ))}
            </FilterGrid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600' }}>
              Adjustments
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Brightness</Typography>
              <Slider
                value={brightness}
                onChange={(_, value) => setBrightness(value as number)}
                min={-50}
                max={50}
                step={1}
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Contrast</Typography>
              <Slider
                value={contrast}
                onChange={(_, value) => setContrast(value as number)}
                min={-50}
                max={50}
                step={1}
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Saturation</Typography>
              <Slider
                value={saturation}
                onChange={(_, value) => setSaturation(value as number)}
                min={-50}
                max={50}
                step={1}
                size="small"
              />
            </Box>
          </EditingPanel>
        </Box>
      </Box>
    </StepContainer>
  );

  const renderCaptionStep = () => (
    <StepContainer>
      <StepHeader>
        <StepTitle>{getStepTitle()}</StepTitle>
      </StepHeader>
      
      <Box sx={{ display: 'flex' }}>
        {/* Media Preview */}
        <Box sx={{ flex: 1, p: 2 }}>
          {previewUrls.length > 0 && (
            selectedFiles[0].type.startsWith('video/') ? (
              <VideoPreview src={previewUrls[0]} controls />
            ) : (
              <MediaPreview src={previewUrls[0]} alt="Preview" />
            )
          )}
        </Box>

        {/* Caption Panel */}
        <Box sx={{ width: '340px', borderLeft: '1px solid #efefef' }}>
          <CaptionArea>
            <Avatar src={user?.avatar} sx={{ width: 28, height: 28, mt: 1 }} />
            <Box sx={{ flex: 1 }}>
              <CaptionInput
                multiline
                rows={4}
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                fullWidth
                variant="outlined"
              />
              
              <Box sx={{ mt: 2 }}>
                <LocationInput
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: '#8e8e8e' }} />,
                  }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <PrivacySelector size="small">
                  <InputLabel>Privacy</InputLabel>
                  <Select
                    value={privacy}
                    label="Privacy"
                    onChange={(e) => setPrivacy(e.target.value)}
                  >
                    <MenuItem value="public">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Public sx={{ mr: 1, fontSize: 18 }} />
                        Public
                      </Box>
                    </MenuItem>
                    <MenuItem value="followers">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Group sx={{ mr: 1, fontSize: 18 }} />
                        Followers
                      </Box>
                    </MenuItem>
                    <MenuItem value="private">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Lock sx={{ mr: 1, fontSize: 18 }} />
                        Private
                      </Box>
                    </MenuItem>
                  </Select>
                </PrivacySelector>
              </Box>
            </Box>
          </CaptionArea>

          <AdvancedSettings>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600' }}>
              Advanced Settings
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={hideFromFeed}
                  onChange={(e) => setHideFromFeed(e.target.checked)}
                />
              }
              label="Hide from feed"
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={turnOffComments}
                  onChange={(e) => setTurnOffComments(e.target.checked)}
                />
              }
              label="Turn off commenting"
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={hideLikeCount}
                  onChange={(e) => setHideLikeCount(e.target.checked)}
                />
              }
              label="Hide like and view counts"
              sx={{ display: 'block' }}
            />
          </AdvancedSettings>
        </Box>
      </Box>
    </StepContainer>
  );

  return (
    <CreateContainer>
      <Header>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, fontSize: '16px', fontWeight: '600' }}>
            {getStepTitle()}
          </Typography>
        </Box>
        
        <Box>
          {step > 1 && step < 3 && (
            <HeaderButton
              variant="text"
              onClick={handleNext}
              sx={{ color: '#0095f6' }}
            >
              Next
            </HeaderButton>
          )}
          {step === 3 && (
            <HeaderButton
              variant="contained"
              onClick={handleShare}
              disabled={isLoading}
              sx={{
                backgroundColor: '#0095f6',
                '&:hover': { backgroundColor: '#1877f2' },
              }}
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </HeaderButton>
          )}
        </Box>
      </Header>

      <ContentArea>
        {step === 1 && renderUploadStep()}
        {step === 2 && renderEditStep()}
        {step === 3 && renderCaptionStep()}
      </ContentArea>
    </CreateContainer>
  );
};

export default CreatePostPage;
