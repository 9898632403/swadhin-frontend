import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { Carousel } from 'primereact/carousel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import '../styles/banner.css';

const AdminBannerPanel = () => {
  const userEmail = localStorage.getItem('email');
  console.log("🧠 Local email:", userEmail);
  const { enqueueSnackbar } = useSnackbar();
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

  const headers = {
    'X-User-Email': userEmail || '',
  };
  console.log("📤 Sent Headers:", headers);

  const [notifications, setNotifications] = useState([]);
  const [banners, setBanners] = useState([]);
  const [newNotification, setNewNotification] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [deleteItem, setDeleteItem] = useState({ id: null, type: null });
  const [uploadMode, setUploadMode] = useState('single');
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % (banners.length || 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchData = async () => {
    try {
      const notifUrl = userEmail === 'admin@example.com'
        ? `${API_URL}/admin/notifications`
        : `${API_URL}/notifications`;

      const notifConfig = userEmail === 'admin@example.com'
        ? { headers }
        : {};

      const [notifsRes, bannersRes] = await Promise.all([
        axios.get(notifUrl, notifConfig),
        axios.get(`${API_URL}/admin/banners`, { headers }),
      ]);
      setNotifications(notifsRes.data);
      setBanners(bannersRes.data);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      showError('Failed to fetch data: ' + (error?.response?.data?.error || 'server error'));
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!newNotification.trim()) return;

    try {
      await axios.post(`${API_URL}/admin/notification`,
        { message: newNotification },
        {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          }
        }
      );
      setNewNotification('');
      fetchData();
      showSuccess('Notification created');
    } catch (error) {
      console.error("❌ Create Notification Error:", error);
      showError('Failed to create notification');
    }
  };

  const handleBannerUpload = async ({ files }) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('banners', file));
    if (redirectUrl) formData.append('redirectUrl', redirectUrl);

    try {
      await axios.post(`${API_URL}/admin/banner`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      setRedirectUrl('');
      fetchData();
      showSuccess(uploadMode === 'single' ? 'Banner uploaded' : 'Banners uploaded');
    } catch (error) {
      console.error("❌ Upload Error:", error);
      showError('Upload failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem.id || !deleteItem.type) return;

    try {
      await axios.delete(`${API_URL}/admin/${deleteItem.type}/${deleteItem.id}`, { headers });
      fetchData();
      showSuccess('Item deleted');
    } catch (error) {
      console.error("❌ Delete Error:", error);
      showError('Deletion failed');
    } finally {
      setDeleteItem({ id: null, type: null });
    }
  };

  const showError = (msg) => enqueueSnackbar(msg, { variant: 'error' });
  const showSuccess = (msg) => enqueueSnackbar(msg, { variant: 'success' });

  const bannerTemplate = (banner) => (
    <div className="banner-item">
      <img
        src={`${API_URL}/static/uploads/banners/${banner.imageUrl}`}
        alt="banner"
      />
      <div className="banner-actions">
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => setDeleteItem({ id: banner._id, type: 'banner' })}
        />
      </div>
    </div>
  );

  return (
    <div className="admin-banner-panel">
      <ConfirmDialog
        visible={!!deleteItem.id}
        onHide={() => setDeleteItem({ id: null, type: null })}
        message="Are you sure you want to delete this item?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={handleDelete}
        reject={() => setDeleteItem({ id: null, type: null })}
      />

      <div className="panel-section">
        <h2>Notification Management</h2>
        <form onSubmit={handleNotificationSubmit} className="notification-form">
          <InputText
            value={newNotification}
            onChange={(e) => setNewNotification(e.target.value)}
            placeholder="Enter notification message"
            className="full-width"
          />
          <Button
            label="Create Notification"
            icon="pi pi-send"
            type="submit"
            className="p-button-raised"
          />
        </form>

        <div className="notification-list">
          {notifications.map(notif => (
            <div key={notif._id} className="notification-item">
              <span>{notif.message}</span>
              {userEmail === 'admin@example.com' && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-text p-button-danger"
                  onClick={() => setDeleteItem({ id: notif._id, type: 'notification' })}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h2>Banner Management</h2>
        <div className="upload-controls">
          <SelectButton
            value={uploadMode}
            options={[
              { label: 'Single Upload', value: 'single' },
              { label: 'Multiple Upload', value: 'multiple' }
            ]}
            onChange={(e) => setUploadMode(e.value)}
          />
          <InputText
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="Redirect URL (optional)"
            className="full-width"
          />
        </div>

        <FileUpload
          name="banners"
          customUpload
          uploadHandler={handleBannerUpload}
          multiple={uploadMode === 'multiple'}
          accept="image/*"
          maxFileSize={5000000}
          chooseLabel="Select Banner(s)"
          uploadLabel="Upload"
          cancelLabel="Cancel"
          emptyTemplate={<p>Drag and drop banner images here</p>}
        />

        <div className="banner-preview">
          <h3>Live Preview</h3>
          {banners.length > 0 ? (
            <Carousel
              ref={carouselRef}
              value={banners}
              itemTemplate={bannerTemplate}
              circular
              autoplayInterval={5000}
              numVisible={1}
              numScroll={1}
              activeIndex={activeIndex}
              onPageChange={(e) => setActiveIndex(e.page)}
            />
          ) : (
            <div className="empty-preview">No banners available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBannerPanel;
