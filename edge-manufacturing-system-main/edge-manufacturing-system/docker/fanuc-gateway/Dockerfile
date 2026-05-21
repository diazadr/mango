FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install MQTT client
RUN pip install --no-cache-dir paho-mqtt

# Copy gateway script and library
COPY pyfanuc.py .
COPY fanuc_mqtt_gateway.py .

# Run gateway
CMD ["python", "fanuc_mqtt_gateway.py"]
