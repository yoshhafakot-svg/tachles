(function () {
  "use strict";

  var ARRIVAL_LABELS = {
    lottery: "הגרלת סטטוסים",
    instagram: "אינסטגרם",
    tiktok: "טיקטוק",
    youtube: "יוטיוב",
    friend: "חבר",
    other: "אחר"
  };

  var form = document.getElementById("lead-form");
  var submitBtn = document.getElementById("submit-btn");
  var btnText = submitBtn.querySelector(".btn-text");
  var btnSpinner = submitBtn.querySelector(".btn-spinner");
  var formAlert = document.getElementById("form-alert");
  var arrivalMethod = document.getElementById("arrivalMethod");
  var otherSourceWrap = document.getElementById("other-source-wrap");
  var otherSource = document.getElementById("otherSource");

  var validators = {
    fullName: function (value) {
      var trimmed = value.trim();
      if (trimmed.length < 2) {
        return "יש להזין שם מלא (לפחות 2 תווים)";
      }
      if (trimmed.length > 100) {
        return "השם ארוך מדי (עד 100 תווים)";
      }
      if (!/^[\u0590-\u05FFa-zA-Z\s.'-]+$/.test(trimmed)) {
        return "השם יכול להכיל אותיות, רווחים ומקפים בלבד";
      }
      return "";
    },

    phone: function (value) {
      var digits = value.replace(/\D/g, "");
      if (digits.startsWith("972")) {
        digits = "0" + digits.slice(3);
      }
      if (!/^0\d{9}$/.test(digits)) {
        return "יש להזין מספר טלפון ישראלי תקין";
      }
      return "";
    },

    email: function (value) {
      var trimmed = value.trim();
      if (!trimmed) {
        return "יש להזין כתובת מייל";
      }
      if (trimmed.length > 254) {
        return "כתובת המייל ארוכה מדי";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return "יש להזין כתובת מייל תקינה";
      }
      return "";
    },

    address: function (value) {
      var trimmed = value.trim();
      if (trimmed.length < 5) {
        return "יש להזין כתובת מגורים (לפחות 5 תווים)";
      }
      if (trimmed.length > 200) {
        return "הכתובת ארוכה מדי (עד 200 תווים)";
      }
      return "";
    },

    institution: function (value) {
      var trimmed = value.trim();
      if (trimmed.length > 150) {
        return "שם המוסד ארוך מדי (עד 150 תווים)";
      }
      return "";
    },

    arrivalMethod: function (value) {
      if (value && !ARRIVAL_LABELS[value]) {
        return "יש לבחור אפשרות תקינה";
      }
      return "";
    },

    otherSource: function (value, formData) {
      if (formData.arrivalMethod === "other") {
        var trimmed = value.trim();
        if (trimmed.length < 2) {
          return "יש לפרט את דרך ההגעה";
        }
        if (trimmed.length > 150) {
          return "הטקסט ארוך מדי (עד 150 תווים)";
        }
      }
      return "";
    },

    consent: function (_value, formData) {
      return formData.consent ? "" : "יש לאשר קבלת דיוור במייל/סמס";
    },
  };

  function getFormData() {
    return {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      institution: document.getElementById("institution").value,
      arrivalMethod: arrivalMethod.value,
      otherSource: otherSource.value,
      consent: document.getElementById("consent").checked
    };
  }

  function normalizePhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.startsWith("972")) {
      digits = "0" + digits.slice(3);
    }
    return digits;
  }

  function setFieldError(fieldName, message) {
    var errorEl = document.querySelector('[data-error-for="' + fieldName + '"]');
    var input = document.getElementById(fieldName);

    if (errorEl) {
      errorEl.textContent = message;
    }

    if (input && input.classList) {
      if (message) {
        input.classList.add("invalid");
      } else {
        input.classList.remove("invalid");
      }
    }
  }

  function clearAllErrors() {
    Object.keys(validators).forEach(function (fieldName) {
      setFieldError(fieldName, "");
    });
  }

  function validateField(fieldName, formData) {
    var input = document.getElementById(fieldName);
    var value = input ? (input.type === "checkbox" ? input.checked : input.value) : "";
    var message = validators[fieldName](value, formData);
    setFieldError(fieldName, message);
    return !message;
  }

  function validateForm(formData) {
    var isValid = true;

    Object.keys(validators).forEach(function (fieldName) {
      if (!validateField(fieldName, formData)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function showAlert(message, type) {
    formAlert.textContent = message;
    formAlert.className = "form-alert " + type;
    formAlert.hidden = false;
  }

  function hideAlert() {
    formAlert.hidden = true;
    formAlert.textContent = "";
    formAlert.className = "form-alert";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnSpinner.hidden = !isLoading;
    btnText.textContent = isLoading ? "שולח..." : "שליחה";
  }

  function toggleOtherSourceField() {
    var isOther = arrivalMethod.value === "other";
    otherSourceWrap.hidden = !isOther;
    if (!isOther) {
      otherSource.value = "";
      setFieldError("otherSource", "");
    }
  }

  arrivalMethod.addEventListener("change", toggleOtherSourceField);

  Object.keys(validators).forEach(function (fieldName) {
    var input = document.getElementById(fieldName);
    if (!input) {
      return;
    }

    var eventName = input.type === "checkbox" ? "change" : "blur";
    input.addEventListener(eventName, function () {
      validateField(fieldName, getFormData());
    });

    if (input.tagName !== "SELECT" && input.type !== "checkbox") {
      input.addEventListener("input", function () {
        if (input.classList.contains("invalid")) {
          validateField(fieldName, getFormData());
        }
      });
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert();
    clearAllErrors();

    var formData = getFormData();

    if (!validateForm(formData)) {
      showAlert("יש לתקן את השגיאות בטופס לפני השליחה", "error");
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    var payload = {
      fullName: formData.fullName.trim(),
      phone: normalizePhone(formData.phone),
      email: formData.email.trim().toLowerCase(),
      address: formData.address.trim(),
      institution: formData.institution.trim() || null,
      arrivalMethod: formData.arrivalMethod || null,
      arrivalMethodLabel: formData.arrivalMethod
        ? ARRIVAL_LABELS[formData.arrivalMethod]
        : null,
      otherSource:
        formData.arrivalMethod === "other"
          ? formData.otherSource.trim()
          : null,
      consent: formData.consent
    };

    setLoading(true);

    fetch(window.APP_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error(result.data.error || "שגיאה בשליחת הטופס");
        }

        showAlert("הפרטים נשלחו בהצלחה! ניצור איתכם קשר בקרוב.", "success");
        form.reset();
        toggleOtherSourceField();
        clearAllErrors();
      })
      .catch(function (error) {
        showAlert(error.message || "אירעה שגיאה. נסו שוב מאוחר יותר.", "error");
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
