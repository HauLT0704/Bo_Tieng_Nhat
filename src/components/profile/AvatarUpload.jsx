import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, RotateCcw, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

export const AvatarUpload = ({ currentAvatar, onAvatarChange, onClose }) => {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh không được lớn hơn 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);
    setScale(1);
    setPosition({ x: 0, y: 0 });

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target.result);
      setCropMode(true);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [dragging, dragStart]);

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = useCallback((e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [dragging, dragStart]);

  const cropAndUpload = async () => {
    if (!previewUrl || !currentUser) return;

    setUploading(true);
    setError('');

    try {
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      const size = 256; // Output size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      // Calculate crop area
      const containerSize = 240; // Preview container size
      const imgScale = scale;
      const drawWidth = img.width * imgScale * (size / containerSize);
      const drawHeight = img.height * imgScale * (size / containerSize);
      const offsetX = position.x * (size / containerSize);
      const offsetY = position.y * (size / containerSize);

      // Draw centered and cropped
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      
      const dx = (size - drawWidth) / 2 + offsetX;
      const dy = (size - drawHeight) / 2 + offsetY;
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));

      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      onAvatarChange(downloadUrl);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Lỗi upload ảnh. Vui lòng thử lại.');
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-[var(--text-primary)]">
            {cropMode ? '✂️ Cắt ảnh đại diện' : '📷 Đổi ảnh đại diện'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-[var(--text-secondary)]">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {!cropMode ? (
            /* File Selector */
            <div className="space-y-4">
              {/* Current Avatar */}
              <div className="flex justify-center">
                <div className="w-28 h-28 rounded-full border-4 border-[var(--border-color)] overflow-hidden bg-[var(--bg-primary)]">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🥑</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="auth-btn-primary w-full"
              >
                <Camera size={18} />
                <span>Chọn ảnh từ thiết bị</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-[10px] text-[var(--text-secondary)] text-center">
                Chấp nhận: JPG, PNG, WEBP • Tối đa 5MB
              </p>
            </div>
          ) : (
            /* Crop Mode */
            <div className="space-y-4">
              {/* Crop Preview */}
              <div className="flex justify-center">
                <div
                  className="w-60 h-60 rounded-full overflow-hidden border-4 border-[var(--bg-accent)]/30 relative cursor-move select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  {previewUrl && (
                    <img
                      ref={imageRef}
                      src={previewUrl}
                      alt="Crop preview"
                      className="absolute pointer-events-none"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      draggable={false}
                    />
                  )}
                </div>
              </div>

              <p className="text-[10px] text-[var(--text-secondary)] text-center font-medium">
                Kéo để di chuyển • Dùng nút zoom để phóng to/thu nhỏ
              </p>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                  className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors text-[var(--text-secondary)]"
                >
                  <ZoomOut size={16} />
                </button>
                <div className="w-32 h-1.5 rounded-full bg-[var(--border-color)] relative">
                  <div
                    className="absolute h-full rounded-full bg-[var(--bg-accent)] transition-all"
                    style={{ width: `${((scale - 0.5) / 2) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                  className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors text-[var(--text-secondary)]"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
                  className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors text-[var(--text-secondary)]"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setCropMode(false); setPreviewUrl(null); setSelectedFile(null); }}
                  className="auth-btn-secondary flex-1"
                >
                  Chọn lại
                </button>
                <button
                  onClick={cropAndUpload}
                  disabled={uploading}
                  className="auth-btn-primary flex-[2]"
                >
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  <span>{uploading ? 'Đang tải lên...' : 'Xác nhận & Lưu'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
