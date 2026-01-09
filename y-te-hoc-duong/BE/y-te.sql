--
-- PostgreSQL database dump
--

\restrict tVhDFe6CzPGl7Lb3HpELPhCi4qA5ddokcBduM8RdCFtJvRzDKC1kBBFwjFgANS9

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2026-01-05 12:56:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5024 (class 1262 OID 24576)
-- Name: yte; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE yte WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1258';


ALTER DATABASE yte OWNER TO postgres;

\unrestrict tVhDFe6CzPGl7Lb3HpELPhCi4qA5ddokcBduM8RdCFtJvRzDKC1kBBFwjFgANS9
\connect yte
\restrict tVhDFe6CzPGl7Lb3HpELPhCi4qA5ddokcBduM8RdCFtJvRzDKC1kBBFwjFgANS9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 869 (class 1247 OID 24587)
-- Name: campaign_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.campaign_status AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'CLOSED'
);


ALTER TYPE public.campaign_status OWNER TO postgres;

--
-- TOC entry 872 (class 1247 OID 24594)
-- Name: gender_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender_type AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public.gender_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 24673)
-- Name: campaign_medical_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_medical_config (
    id bigint NOT NULL,
    config_name character varying NOT NULL
);


ALTER TABLE public.campaign_medical_config OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24672)
-- Name: campaign_medical_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_medical_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_medical_config_id_seq OWNER TO postgres;

--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 227
-- Name: campaign_medical_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_medical_config_id_seq OWNED BY public.campaign_medical_config.id;


--
-- TOC entry 233 (class 1259 OID 24790)
-- Name: campaign_medical_config_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_medical_config_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_medical_config_seq OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 24816)
-- Name: campaign_medical_config_sub; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_medical_config_sub (
    id bigint NOT NULL,
    medical_group_id bigint NOT NULL,
    campaign_medical_config_id bigint NOT NULL,
    display_order integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying,
    updated_by character varying
);


ALTER TABLE public.campaign_medical_config_sub OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 24815)
-- Name: campaign_medical_config_sup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_medical_config_sup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_medical_config_sup_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 239
-- Name: campaign_medical_config_sup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_medical_config_sup_id_seq OWNED BY public.campaign_medical_config_sub.id;


--
-- TOC entry 241 (class 1259 OID 24847)
-- Name: campaign_medical_config_sup_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_medical_config_sup_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_medical_config_sup_seq OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24600)
-- Name: medical_campaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_campaign (
    id bigint NOT NULL,
    school_id bigint NOT NULL,
    school_year character varying(20),
    campaign_name character varying(255),
    start_date date,
    end_date date,
    status character varying(50) NOT NULL,
    note character varying(1000),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) DEFAULT 'ADMIN'::character varying NOT NULL,
    updated_by character varying(255) DEFAULT 'ADMIN'::character varying NOT NULL,
    total_students integer,
    total_students_examined integer,
    campaign_medical_config_id bigint NOT NULL
);


ALTER TABLE public.medical_campaign OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24599)
-- Name: medical_campaign_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_campaign_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_campaign_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 217
-- Name: medical_campaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_campaign_id_seq OWNED BY public.medical_campaign.id;


--
-- TOC entry 231 (class 1259 OID 24788)
-- Name: medical_campaign_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_campaign_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_campaign_seq OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24635)
-- Name: medical_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_group (
    id bigint NOT NULL,
    group_code character varying(50) NOT NULL,
    group_name character varying(255),
    display_order integer,
    is_active boolean DEFAULT true
);


ALTER TABLE public.medical_group OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24634)
-- Name: medical_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_group_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 221
-- Name: medical_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_group_id_seq OWNED BY public.medical_group.id;


--
-- TOC entry 238 (class 1259 OID 24795)
-- Name: medical_group_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_group_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_group_seq OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24645)
-- Name: medical_indicator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_indicator (
    id bigint NOT NULL,
    group_id bigint NOT NULL,
    indicator_code character varying(50) NOT NULL,
    indicator_name character varying(255),
    display_order integer,
    is_active boolean DEFAULT true,
    has_sub_indicator boolean
);


ALTER TABLE public.medical_indicator OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24644)
-- Name: medical_indicator_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_indicator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_indicator_id_seq OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 223
-- Name: medical_indicator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_indicator_id_seq OWNED BY public.medical_indicator.id;


--
-- TOC entry 234 (class 1259 OID 24791)
-- Name: medical_indicator_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_indicator_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_indicator_seq OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24748)
-- Name: medical_result_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_result_detail (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    result_value boolean,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    medical_group_id bigint,
    medical_indicator_id bigint,
    medical_sub_indicator_id bigint,
    campaign_id bigint,
    created_by character varying,
    updated_by character varying
);


ALTER TABLE public.medical_result_detail OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24747)
-- Name: medical_result_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_result_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_result_detail_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 229
-- Name: medical_result_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_result_detail_id_seq OWNED BY public.medical_result_detail.id;


--
-- TOC entry 235 (class 1259 OID 24792)
-- Name: medical_result_detail_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_result_detail_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_result_detail_seq OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24660)
-- Name: medical_sub_indicator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_sub_indicator (
    id bigint NOT NULL,
    indicator_id bigint NOT NULL,
    sub_code character varying(50),
    sub_name character varying(255),
    display_order integer,
    is_active boolean DEFAULT true
);


ALTER TABLE public.medical_sub_indicator OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24659)
-- Name: medical_sub_indicator_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_sub_indicator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_sub_indicator_id_seq OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 225
-- Name: medical_sub_indicator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_sub_indicator_id_seq OWNED BY public.medical_sub_indicator.id;


--
-- TOC entry 236 (class 1259 OID 24793)
-- Name: medical_sub_indicator_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_sub_indicator_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_sub_indicator_seq OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 24578)
-- Name: school; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school (
    id bigint NOT NULL,
    school_code character varying(50),
    school_name character varying(255),
    address character varying(500)
);


ALTER TABLE public.school OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 24577)
-- Name: school_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.school_id_seq OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 215
-- Name: school_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.school_id_seq OWNED BY public.school.id;


--
-- TOC entry 232 (class 1259 OID 24789)
-- Name: school_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.school_seq OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24617)
-- Name: student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student (
    id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    full_name character varying(255) NOT NULL,
    gender character varying(50) NOT NULL,
    dob date NOT NULL,
    address character varying(500),
    identity_number character varying(50) NOT NULL,
    weight numeric(5,2),
    height numeric(5,2),
    notify_family character varying(1000),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) DEFAULT 'ADMIN'::character varying NOT NULL,
    updated_by character varying(255) DEFAULT 'ADMIN'::character varying NOT NULL
);


ALTER TABLE public.student OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24616)
-- Name: student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_id_seq OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 219
-- Name: student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_id_seq OWNED BY public.student.id;


--
-- TOC entry 237 (class 1259 OID 24794)
-- Name: student_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_seq OWNER TO postgres;

--
-- TOC entry 4807 (class 2604 OID 24676)
-- Name: campaign_medical_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config ALTER COLUMN id SET DEFAULT nextval('public.campaign_medical_config_id_seq'::regclass);


--
-- TOC entry 4811 (class 2604 OID 24819)
-- Name: campaign_medical_config_sub id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config_sub ALTER COLUMN id SET DEFAULT nextval('public.campaign_medical_config_sup_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 24603)
-- Name: medical_campaign id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_campaign ALTER COLUMN id SET DEFAULT nextval('public.medical_campaign_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 24638)
-- Name: medical_group id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_group ALTER COLUMN id SET DEFAULT nextval('public.medical_group_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 24648)
-- Name: medical_indicator id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_indicator ALTER COLUMN id SET DEFAULT nextval('public.medical_indicator_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 24751)
-- Name: medical_result_detail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_result_detail ALTER COLUMN id SET DEFAULT nextval('public.medical_result_detail_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 24663)
-- Name: medical_sub_indicator id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_sub_indicator ALTER COLUMN id SET DEFAULT nextval('public.medical_sub_indicator_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 24581)
-- Name: school id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school ALTER COLUMN id SET DEFAULT nextval('public.school_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 24620)
-- Name: student id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student ALTER COLUMN id SET DEFAULT nextval('public.student_id_seq'::regclass);


--
-- TOC entry 5005 (class 0 OID 24673)
-- Dependencies: 228
-- Data for Name: campaign_medical_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_medical_config (id, config_name) FROM stdin;
1	default
\.


--
-- TOC entry 5017 (class 0 OID 24816)
-- Dependencies: 240
-- Data for Name: campaign_medical_config_sub; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_medical_config_sub (id, medical_group_id, campaign_medical_config_id, display_order, created_at, updated_at, created_by, updated_by) FROM stdin;
3	1	1	1	2025-12-30 17:54:04.443	2025-12-30 17:54:04.443	ADMIN	ADMIN
4	2	1	2	2025-12-30 17:54:15.678	2025-12-30 17:54:15.678	ADMIN	ADMIN
5	3	1	3	2025-12-30 17:54:19.665	2025-12-30 17:54:19.665	ADMIN	ADMIN
6	4	1	4	2025-12-30 17:54:24.637	2025-12-30 17:54:24.637	ADMIN	ADMIN
7	5	1	5	2025-12-30 17:54:29.383	2025-12-30 17:54:29.383	ADMIN	ADMIN
8	6	1	6	2025-12-30 17:54:33.975	2025-12-30 17:54:33.975	ADMIN	ADMIN
9	7	1	7	2025-12-30 17:54:47.627	2025-12-30 17:54:47.627	ADMIN	ADMIN
10	8	1	8	2025-12-30 17:54:53.672	2025-12-30 17:54:53.672	ADMIN	ADMIN
\.


--
-- TOC entry 4995 (class 0 OID 24600)
-- Dependencies: 218
-- Data for Name: medical_campaign; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_campaign (id, school_id, school_year, campaign_name, start_date, end_date, status, note, created_at, updated_at, created_by, updated_by, total_students, total_students_examined, campaign_medical_config_id) FROM stdin;
8	1	2025	Đợt khám học kỳ 1 2025	2025-03-03	2025-03-03	DRAFT	Đợt khám học kỳ 1 của trường THCS Bồ Đề	2025-12-30 14:58:26.179	2025-12-30 14:58:26.179	ADMIN	ADMIN	120	120	1
\.


--
-- TOC entry 4999 (class 0 OID 24635)
-- Dependencies: 222
-- Data for Name: medical_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_group (id, group_code, group_name, display_order, is_active) FROM stdin;
5	MUSCULOSKELETAL	Cơ xương khớp	5	t
6	DERMATOLOGY	Da liễu	6	t
7	MENTAL_NEURO	Tâm thần kinh	7	t
8	INTERNAL_MEDICINE	Nội khoa	8	t
1	NUTRITION	Dinh  dưỡng	1	t
2	EYE_HEALTH	Mắt	2	t
3	DENTAL_HEALTH	Răng	3	t
4	ENT	Tai mũi họng	4	t
\.


--
-- TOC entry 5001 (class 0 OID 24645)
-- Dependencies: 224
-- Data for Name: medical_indicator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_indicator (id, group_id, indicator_code, indicator_name, display_order, is_active, has_sub_indicator) FROM stdin;
19	5	SCOLIOSIS	Vẹo cột sống	2	t	\N
20	5	OTHER_MSK	Bệnh khác	3	t	\N
21	5	SPINAL_DEFORMITY	Cong cột sống	1	t	\N
22	6	DERMATITIS	Viêm da	1	t	\N
23	6	PSORIASIS	Vảy nến	2	t	\N
24	6	OTHER_SKIN	Bệnh khác	3	t	\N
25	7	MENTAL_DISORDER	Rối loạn tâm thần	1	t	\N
26	7	AUTISM_SCHIZO	Tâm thần phân liệt	2	t	\N
27	8	ASTHMA	Hen phế quản	1	t	\N
28	8	RHEUMATIC_HEART	Thấp tim	2	t	\N
29	8	GOITER	Bướu cổ	3	t	\N
30	8	CONGENITAL_ANOMALY	Dị tật bẩm sinh	4	t	\N
31	8	OTHER	Bệnh khác	5	t	\N
2	1	OVERWEIGHT	Thừa cân	2	t	\N
3	1	UNDERNUTRITION	Suy Dinh Dưỡng	1	t	\N
4	1	OBESITY	Béo Phì	3	t	\N
5	2	CONJUNCTIVITIS	Viêm kết mạc	1	t	\N
6	2	HYPEROPIA	Viễn Thị	3	t	\N
7	2	ASTIGMATISM	Loạn thị	4	t	\N
8	2	STRABISMUS	Lác	5	t	\N
9	2	CATARACT	Đục thể thủy tinh	6	t	\N
10	2	REFRACTIVE_ERROR	Tật Khúc Xạ	7	t	\N
11	2	MYOPIA	Cận thị	2	t	t
12	3	DENTAL_CARIES	Sâu răng	1	t	\N
13	3	TOOTH_LOSS	Mất răng	2	t	\N
14	3	GINGIVITIS	Viêm lợi	3	t	\N
15	3	FILLED_TOOTH	Răng đã hàn	4	t	\N
16	4	NASOPHARYNGITIS	Viêm mũi họng	1	t	\N
17	4	OTITIS_MEDIA	Viêm tai giữa	2	t	\N
18	4	OTHER_ENT	Bệnh khác	3	t	\N
\.


--
-- TOC entry 5007 (class 0 OID 24748)
-- Dependencies: 230
-- Data for Name: medical_result_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_result_detail (id, student_id, result_value, created_at, updated_at, medical_group_id, medical_indicator_id, medical_sub_indicator_id, campaign_id, created_by, updated_by) FROM stdin;
193	8	f	2026-01-05 12:44:13.182	\N	1	3	\N	8	SYSTEM	\N
194	8	f	2026-01-05 12:44:13.182	\N	2	5	\N	8	SYSTEM	\N
195	8	f	2026-01-05 12:44:13.182	\N	3	12	\N	8	SYSTEM	\N
196	8	f	2026-01-05 12:44:13.182	\N	4	16	\N	8	SYSTEM	\N
197	8	f	2026-01-05 12:44:13.182	\N	5	21	\N	8	SYSTEM	\N
198	8	f	2026-01-05 12:44:13.182	\N	6	22	\N	8	SYSTEM	\N
199	8	f	2026-01-05 12:44:13.182	\N	7	25	\N	8	SYSTEM	\N
200	8	f	2026-01-05 12:44:13.182	\N	8	27	\N	8	SYSTEM	\N
201	8	f	2026-01-05 12:44:13.182	\N	1	2	\N	8	SYSTEM	\N
202	8	f	2026-01-05 12:44:13.182	\N	2	11	\N	8	SYSTEM	\N
203	8	f	2026-01-05 12:44:13.182	\N	3	13	\N	8	SYSTEM	\N
204	8	f	2026-01-05 12:44:13.182	\N	4	17	\N	8	SYSTEM	\N
205	8	f	2026-01-05 12:44:13.182	\N	5	19	\N	8	SYSTEM	\N
206	8	f	2026-01-05 12:44:13.182	\N	6	23	\N	8	SYSTEM	\N
207	8	f	2026-01-05 12:44:13.182	\N	7	26	\N	8	SYSTEM	\N
208	8	f	2026-01-05 12:44:13.182	\N	8	28	\N	8	SYSTEM	\N
209	8	f	2026-01-05 12:44:13.182	\N	1	4	\N	8	SYSTEM	\N
210	8	f	2026-01-05 12:44:13.182	\N	2	6	\N	8	SYSTEM	\N
211	8	f	2026-01-05 12:44:13.182	\N	3	14	\N	8	SYSTEM	\N
212	8	f	2026-01-05 12:44:13.182	\N	4	18	\N	8	SYSTEM	\N
213	8	f	2026-01-05 12:44:13.182	\N	5	20	\N	8	SYSTEM	\N
214	8	f	2026-01-05 12:44:13.182	\N	6	24	\N	8	SYSTEM	\N
215	8	f	2026-01-05 12:44:13.182	\N	8	29	\N	8	SYSTEM	\N
216	8	f	2026-01-05 12:44:13.182	\N	2	7	\N	8	SYSTEM	\N
217	8	f	2026-01-05 12:44:13.182	\N	3	15	\N	8	SYSTEM	\N
218	8	f	2026-01-05 12:44:13.182	\N	8	30	\N	8	SYSTEM	\N
219	8	f	2026-01-05 12:44:13.182	\N	2	8	\N	8	SYSTEM	\N
220	8	f	2026-01-05 12:44:13.182	\N	8	31	\N	8	SYSTEM	\N
221	8	f	2026-01-05 12:44:13.182	\N	2	9	\N	8	SYSTEM	\N
222	8	f	2026-01-05 12:44:13.182	\N	2	10	\N	8	SYSTEM	\N
223	8	f	2026-01-05 12:44:13.182	\N	2	7	1	8	SYSTEM	\N
224	8	f	2026-01-05 12:44:13.182	\N	2	7	2	8	SYSTEM	\N
\.


--
-- TOC entry 5003 (class 0 OID 24660)
-- Dependencies: 226
-- Data for Name: medical_sub_indicator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_sub_indicator (id, indicator_id, sub_code, sub_name, display_order, is_active) FROM stdin;
1	7	CORRECTED	Corrected Myopia	1	t
2	7	UNDER_CORRECTED	Under-corrected Myopia	2	t
\.


--
-- TOC entry 4993 (class 0 OID 24578)
-- Dependencies: 216
-- Data for Name: school; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school (id, school_code, school_name, address) FROM stdin;
1	0810	THCS BỒ ĐỀ	135 P. Hoàng Như Tiếp, Bồ Đề, Long Biên, Hà Nội
\.


--
-- TOC entry 4997 (class 0 OID 24617)
-- Dependencies: 220
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student (id, campaign_id, full_name, gender, dob, address, identity_number, weight, height, notify_family, created_at, updated_at, created_by, updated_by) FROM stdin;
8	8	test	MALE	2002-10-30	test	test	\N	\N	\N	2026-01-05 12:44:13.175	2026-01-05 12:44:13.175	ADMIN	ADMIN
\.


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 227
-- Name: campaign_medical_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_medical_config_id_seq', 1, true);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 233
-- Name: campaign_medical_config_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_medical_config_seq', 1, false);


--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 239
-- Name: campaign_medical_config_sup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_medical_config_sup_id_seq', 1, false);


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 241
-- Name: campaign_medical_config_sup_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_medical_config_sup_seq', 10, true);


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 217
-- Name: medical_campaign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_campaign_id_seq', 1, false);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 231
-- Name: medical_campaign_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_campaign_seq', 8, true);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 221
-- Name: medical_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_group_id_seq', 1, false);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 238
-- Name: medical_group_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_group_seq', 8, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 223
-- Name: medical_indicator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_indicator_id_seq', 1, false);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 234
-- Name: medical_indicator_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_indicator_seq', 31, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 229
-- Name: medical_result_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_result_detail_id_seq', 1, false);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 235
-- Name: medical_result_detail_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_result_detail_seq', 224, true);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 225
-- Name: medical_sub_indicator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_sub_indicator_id_seq', 1, false);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 236
-- Name: medical_sub_indicator_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_sub_indicator_seq', 2, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 215
-- Name: school_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.school_id_seq', 1, true);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 232
-- Name: school_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.school_seq', 1, false);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 219
-- Name: student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_id_seq', 1, false);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 237
-- Name: student_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_seq', 8, true);


--
-- TOC entry 4833 (class 2606 OID 24679)
-- Name: campaign_medical_config campaign_medical_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config
    ADD CONSTRAINT campaign_medical_config_pkey PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 24824)
-- Name: campaign_medical_config_sub campaign_medical_config_sup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config_sub
    ADD CONSTRAINT campaign_medical_config_sup_pkey PRIMARY KEY (id);


--
-- TOC entry 4817 (class 2606 OID 24610)
-- Name: medical_campaign medical_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_campaign
    ADD CONSTRAINT medical_campaign_pkey PRIMARY KEY (id);


--
-- TOC entry 4823 (class 2606 OID 24643)
-- Name: medical_group medical_group_group_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_group
    ADD CONSTRAINT medical_group_group_code_key UNIQUE (group_code);


--
-- TOC entry 4825 (class 2606 OID 24641)
-- Name: medical_group medical_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_group
    ADD CONSTRAINT medical_group_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 24651)
-- Name: medical_indicator medical_indicator_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_indicator
    ADD CONSTRAINT medical_indicator_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 24757)
-- Name: medical_result_detail medical_result_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_result_detail
    ADD CONSTRAINT medical_result_detail_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 24666)
-- Name: medical_sub_indicator medical_sub_indicator_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_sub_indicator
    ADD CONSTRAINT medical_sub_indicator_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 24585)
-- Name: school school_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school
    ADD CONSTRAINT school_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 24626)
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 24826)
-- Name: campaign_medical_config_sub uk_campaign_config_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config_sub
    ADD CONSTRAINT uk_campaign_config_group UNIQUE (campaign_medical_config_id, medical_group_id);


--
-- TOC entry 4829 (class 2606 OID 24653)
-- Name: medical_indicator uk_indicator_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_indicator
    ADD CONSTRAINT uk_indicator_code UNIQUE (indicator_code);


--
-- TOC entry 4821 (class 2606 OID 24628)
-- Name: student uk_student_campaign_identity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT uk_student_campaign_identity UNIQUE (campaign_id, identity_number);


--
-- TOC entry 4840 (class 2606 OID 24611)
-- Name: medical_campaign fk_campaign_school; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_campaign
    ADD CONSTRAINT fk_campaign_school FOREIGN KEY (school_id) REFERENCES public.school(id);


--
-- TOC entry 4847 (class 2606 OID 24832)
-- Name: campaign_medical_config_sub fk_config_sup_campaign_config; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config_sub
    ADD CONSTRAINT fk_config_sup_campaign_config FOREIGN KEY (campaign_medical_config_id) REFERENCES public.campaign_medical_config(id);


--
-- TOC entry 4848 (class 2606 OID 24827)
-- Name: campaign_medical_config_sub fk_config_sup_medical_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_medical_config_sub
    ADD CONSTRAINT fk_config_sup_medical_group FOREIGN KEY (medical_group_id) REFERENCES public.medical_group(id);


--
-- TOC entry 4843 (class 2606 OID 24654)
-- Name: medical_indicator fk_indicator_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_indicator
    ADD CONSTRAINT fk_indicator_group FOREIGN KEY (group_id) REFERENCES public.medical_group(id);


--
-- TOC entry 4841 (class 2606 OID 24837)
-- Name: medical_campaign fk_medical_campaign_campaign_medical_config; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_campaign
    ADD CONSTRAINT fk_medical_campaign_campaign_medical_config FOREIGN KEY (campaign_medical_config_id) REFERENCES public.campaign_medical_config(id);


--
-- TOC entry 4845 (class 2606 OID 24842)
-- Name: medical_result_detail fk_medical_campaign_medical_result_detail; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_result_detail
    ADD CONSTRAINT fk_medical_campaign_medical_result_detail FOREIGN KEY (campaign_id) REFERENCES public.medical_campaign(id);


--
-- TOC entry 4846 (class 2606 OID 24760)
-- Name: medical_result_detail fk_result_student; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_result_detail
    ADD CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES public.student(id);


--
-- TOC entry 4842 (class 2606 OID 24629)
-- Name: student fk_student_campaign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT fk_student_campaign FOREIGN KEY (campaign_id) REFERENCES public.medical_campaign(id);


--
-- TOC entry 4844 (class 2606 OID 24667)
-- Name: medical_sub_indicator fk_sub_indicator_indicator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_sub_indicator
    ADD CONSTRAINT fk_sub_indicator_indicator FOREIGN KEY (indicator_id) REFERENCES public.medical_indicator(id);


-- Completed on 2026-01-05 12:56:56

--
-- PostgreSQL database dump complete
--

\unrestrict tVhDFe6CzPGl7Lb3HpELPhCi4qA5ddokcBduM8RdCFtJvRzDKC1kBBFwjFgANS9

